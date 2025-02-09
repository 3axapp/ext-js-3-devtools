export declare global {
  namespace Ext {
    interface ComponentListenerCollection {
      name: string,
      obj: Component,
      listeners: ComponentEventListener[],
    }
    interface ComponentEventListener {
      fireFn: Function,
      fn: Function,
      options: Record<string, any>,
      scope: object,
    }

    const versionDetail: {
      major: number,
      minor: number,
      path: number,
    };

    const ComponentMgr: {
      get: (id: string) => ?Component,
      all: {
        items: Component[],
        map: Record<string, Component>,
        on: (event: string, cb: Function) => void;
      },
      types: Record<string, Function>,
    };

    class Component {
      constructor(...args: any[]);
      superclass: () => Component;
      id: string;
      ctype: string;
      xtype?: string;
      initialConfig: Record<string, any>;
      modal?: boolean;
      items?: {
        items: Component[],
      };
      ownerCt?: Component;
      el: {
        dom: HTMLElement,
        id: string,
      };
      events: Record<string, boolean | ComponentListenerCollection>;
    }
  }
}
