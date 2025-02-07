export interface ExtJSComponent {
  constructor: Function,
  superclass: () => { constructor: Function },
  id: string,
  ctype: string,
  xtype?: string,
  initialConfig: Record<string, any>,
  modal?: boolean,
  items?: {
    items: ExtJSComponent[],
  },
  ownerCt?: ExtJSComponent,
  el: {
    dom: HTMLElement,
    id: string,
  },
}

declare global {
  interface Window {
    Ext: null | {
      versionDetail: {
        major: number,
        minor: number,
        path: number,
      },
      ComponentMgr: {
        get: (id: string) => ?ExtJSComponent,
        all: {
          items: ExtJSComponent[],
          map: Record<string, ExtJSComponent>,
          on: (event: string, cb: Function) => void;
        },
        types: Record<string, Function>,
      },
      isEmpty: (...args: any[]) => boolean,
      Component: {
        new(...args): any
      }
    };
  }
}
