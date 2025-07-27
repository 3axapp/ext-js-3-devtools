/// <reference types="chrome"/>
import Port = chrome.runtime.Port;
import {Events, Topic} from '../app/protocols/messages';

export class TabManager {
  public constructor(
    private runtime: typeof chrome.runtime,
    private tabs: Record<string, DevToolsConnection> = {},
  ) {}

  public initialize(): void {
    this.runtime.onConnect.addListener((port: Port): void => {
      if (isNumeric(port.name)) {
        this.registerDevToolsForTab(port);
        return;
      }

      if (port?.sender?.tab?.id === undefined || port.sender.frameId === undefined) {
        console.warn('Это ж-ж-ж неспроста', port);
        return;
      }

      this.registerContentScriptForTab(port);
    });
  }

  private registerDevToolsForTab(port: chrome.runtime.Port): void {
    // For the devtools page, our port name is the tab id.
    const tabId = parseInt(port.name, 10);

    const tab = this.getTab(tabId);

    tab.devtools = port;
    tab.devtools.onDisconnect.addListener(() => {
      tab.devtools = null;

      for (const connection of Object.values(tab.contentScripts)) {
        connection.enabled = false;
      }
    });

    for (const [frameId, connection] of Object.entries(tab.contentScripts)) {
      connection.backendReady!.then(() => {
        if (connection.port === null) {
          throw new Error('Expected Content to have already connected before the backendReady event on the same page.');
        }
        this.doublePipe(tab.devtools, connection);
        tab.devtools!.postMessage({
          topic: 'contentScriptConnected',
          args: [parseInt(frameId, 10), connection.port.name, connection.port.sender!.url],
        });
      });
    }
  }

  private registerContentScriptForTab(port: Port): void {
    const sender = port.sender!;
    const frameId = sender.frameId!;
    const tabId = sender.tab!.id!;

    const tab = this.getTab(tabId);

    if (tab.contentScripts[frameId] === undefined) {
      tab.contentScripts[frameId] = {
        port: null,
        enabled: false,
        frameId: -1,
      };
    }

    const contentScript = tab.contentScripts[frameId]!;
    contentScript.port = port;
    contentScript.frameId = frameId;
    contentScript.enabled = contentScript.enabled ?? false;

    port.onDisconnect.addListener(() => {
      delete tab.contentScripts[frameId];

      if (Object.keys(tab.contentScripts).length === 0) {
        delete this.tabs[tabId];
      }
    });

    contentScript.backendReady = new Promise(resolveBackendReady => {
      const onBackendReady = (message: {topic: string}) => {
        if (message.topic === 'backendReady') {
          resolveBackendReady();

          if (tab.devtools) {
            this.doublePipe(tab.devtools, contentScript);

            tab.devtools.postMessage({
              topic: 'contentScriptConnected',
              args: [frameId, contentScript.port!.name, contentScript.port!.sender!.url],
            });
          }

          port.onMessage.removeListener(onBackendReady);
        }
      };

      port.onMessage.addListener(onBackendReady);
      port.onDisconnect.addListener(() => {
        port.onMessage.removeListener(onBackendReady);
      });
    });
  }

  private getTab(tabId: number): DevToolsConnection {
    this.ensureTabExists(tabId);
    return this.tabs[tabId];
  }

  private ensureTabExists(tabId: number): void {
    this.tabs[tabId] ??= {
      devtools: null,
      contentScripts: {},
    };
  }

  private doublePipe(devtoolsPort: chrome.runtime.Port | null, contentScriptConnection: ContentScriptConnection): void {
    if (devtoolsPort === null) {
      throw new Error('DevTools port is equal to null');
    }

    const contentScriptPort = contentScriptConnection.port;

    if (contentScriptPort === null) {
      throw new Error('Content script port is equal to null');
    }

    console.log('Creating two-way communication channel', Date.now(), this.tabs);

    const onDevToolsMessage = (message: {topic: Topic; args: Parameters<Events[Topic]>}) => {
      if (message.topic === 'enableFrameConnection') {
        if (message.args.length !== 2) {
          throw new Error('Expected two arguments for enableFrameConnection');
        }

        const [frameId, tabId] = message.args as [frameId: number, tabId: number];

        if (frameId === contentScriptConnection.frameId) {
          const tab = this.tabs[tabId];

          if (tab === undefined) {
            throw new Error(`Expected tab to be registered with tabId ${tabId}`);
          }

          for (const frameId of Object.keys(tab.contentScripts)) {
            tab.contentScripts[frameId].enabled = false;
          }

          contentScriptConnection.enabled = true;
          devtoolsPort.postMessage({
            topic: 'frameConnected',
            args: [contentScriptConnection.frameId],
          });
        }
      }

      if (!contentScriptConnection.enabled) {
        return;
      }

      contentScriptPort.postMessage(message);
    };
    devtoolsPort.onMessage.addListener(onDevToolsMessage);

    const onContentScriptMessage = (message: {topic: Topic; args: Parameters<Events[Topic]>}) => {
      if (!contentScriptConnection.enabled) {
        return;
      }

      devtoolsPort.postMessage(message);
    };
    contentScriptPort.onMessage.addListener(onContentScriptMessage);

    const shutdownContentScript = () => {
      devtoolsPort.onMessage.removeListener(onDevToolsMessage);
      devtoolsPort.postMessage({
        topic: 'contentScriptDisconnected',
        args: [contentScriptConnection.frameId, contentScriptConnection.port!.name],
      });

      contentScriptPort.onMessage.removeListener(onContentScriptMessage);
    };
    contentScriptPort.onDisconnect.addListener(() => shutdownContentScript());
  }
}

interface DevToolsConnection {
  devtools: Port | null;
  contentScripts: Record<string, ContentScriptConnection>;
}

export interface ContentScriptConnection {
  port: Port | null;
  enabled: boolean;
  frameId: 'devtools' | number;
  backendReady?: Promise<void>;
}

function isNumeric(str: string): boolean {
  return +str + '' === str;
}
