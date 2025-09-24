/// <reference types="chrome"/>
import Port = chrome.runtime.Port;
import {Parameters} from './messages';

export class PortBus<T extends Record<string, (...args: never[]) => void>> {
  private listeners: Partial<T> = {};
  public constructor(private port: Port) {
    this.port.onMessage.addListener(<E extends keyof T>(e: {topic: E; args: Parameters<T[E]>}) => {
      if (this.listeners[e.topic]) {
        this.listeners[e.topic]!(...e.args);
      }
    });
  }

  public on<E extends keyof T>(topic: E, cb: T[E]): void {
    this.listeners[topic] = cb;
  }

  public emit<E extends keyof T>(topic: E, ...args: Parameters<T[E]>): void {
    this.port.postMessage({topic, args});
  }
}
