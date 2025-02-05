/// <reference types="chrome"/>
import Port = chrome.runtime.Port;
import {Parameters} from './messages';

export class PortBus<T extends Record<string, (...args: any[]) => void>>{
  private listeners: Partial<T> = {};
  constructor(
    private port: Port,
  ) {
    this.port.onMessage.addListener((e: {topic: keyof T, args: any[]}) => {
      if (this.listeners[e.topic]) {
        this.listeners[e.topic]!(...e.args);
      }
    });
  }

  on<E extends keyof T>(topic: E, cb: T[E]): void {
    this.listeners[topic] = cb;
  }

  emit<E extends keyof T>(topic: E, ...args: Parameters<T[E]>): void {
    this.port.postMessage({topic, args});
    // window.postMessage({
    //   source: this.source,
    //   topic,
    //   args
    // });
  }
}
