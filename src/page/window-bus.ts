import {Events, Message, Parameters} from '../app/protocols/messages';

export class WindowBus<T extends Events> {
  private listeners: Partial<T> = {};

  private windowListener = (e: MessageEvent<Message<T>>) => {
    if (!e.data || e.data.source !== this.destination) {
      return;
    }

    if (this.listeners[e.data.topic]) {
      this.listeners[e.data.topic]!(...e.data.args);
    }
  };

  public constructor(
    private source: string,
    private destination: string,
  ) {
    window.addEventListener('message', this.windowListener);
  }

  public on<E extends keyof T>(topic: E, cb: T[E]): void {
    this.listeners[topic] = cb;
  }

  public emit<E extends keyof T>(topic: E, ...args: Parameters<T[E]>): void {
    window.postMessage({
      source: this.source,
      topic,
      args,
    });
  }

  public destroy() {
    this.listeners = {};
    window.removeEventListener('message', this.windowListener);
  }
}
