export declare global {
  namespace Ext {
    interface ComponentListenerCollection {
      name: string;
      obj: Component;
      listeners: ComponentEventListener[];
    }

    interface ComponentEventListener {
      fireFn: Function;
      fn: Function;
      options: Record<string, any>;
      scope: object;
    }

    const versionDetail: {
      major: number;
      minor: number;
      path: number;
    };

    const ComponentMgr: {
      get: (id: string) => ?Component;
      all: {
        items: Component[];
        map: Record<string, Component>;
        on: (event: string, cb: Function) => void;
        each: (cb: (item: Component, i: number, len: number) => void) => void;
      };
      types: Record<string, Function>;
    };

    const util: {
      Observable: new (...args) => any;
    };

    class Component {
      public constructor(...args: any[]);

      public superclass: () => Component;
      public id: string;
      public ctype: string;
      public xtype?: string;
      public name?: string;
      public initialConfig: Record<string, any>;
      public modal?: boolean;
      public items?: {
        items: Component[];
      };
      public ownerCt?: Component;
      public el: Element;
      public wrap?: Element;
      public itemCt?: Element;
      public events: Record<string, boolean | string | ComponentListenerCollection>;
    }

    class Element {
      public dom: HTMLElement;
      public id: string;
    }
  }
}
