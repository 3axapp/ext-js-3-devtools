import {ComponentNode} from './forest';
import {xTypeAliases} from './ext-js/xtypes';
import {ExtJSComponent} from './ext-js/ext-js';

export let types: Map<Function, string> = new Map();
let indexMap: Map<ExtJSComponent, ExtJSComponent[]>;

export class Detector {

  private forest: ComponentNode[] = [];

  public detect() {
    const ext = window.Ext;
    return Boolean(
      ext?.versionDetail?.major == 3 &&
      ext.versionDetail?.minor == 4,
    );
  }

  public onChange(cb: Function) {
    if (!this.detect()) {
      return;
    }

    let timeout: number;
    const debounce = () => {
      if (timeout) {
        window.clearTimeout(timeout);
      }
      timeout = window.setTimeout(cb, 200);
    };
    const ext = window.Ext!;

    ext.ComponentMgr.all.on('add', debounce);
    // ext.ComponentMgr.all.on('clear', cb);
    ext.ComponentMgr.all.on('remove', debounce);
    ext.ComponentMgr.all.on('replace', debounce);
  }

  public buildForest(): ComponentNode[] {
    types = new Map();
    for (let [n, c] of Object.entries(window.Ext!.ComponentMgr.types)) {
      types.set(c, xTypeAliases[n] || n);
    }
    indexMap = new Map();
    window.Ext!.ComponentMgr.all.items.forEach((i) => {
      const ownerCt = i.ownerCt || i.initialConfig['ownerCt'];
      if (!ownerCt) {
        return;
      }
      if (!indexMap.has(ownerCt)) {
        indexMap.set(ownerCt, []);
      }
      indexMap.get(ownerCt)!.push(i);
    });
    return this.forest = this.findRoots().map(extJSComponentToNodeWithChildren);
  }

  public getForest(): ComponentNode[] {
    return this.forest;
  }

  private findRoots(): ExtJSComponent[] {
    return window.Ext!.ComponentMgr.all.items.filter(i => !i.ownerCt && !i.initialConfig['ownerCt']);
  }

  public has(selectedNode: ComponentNode | undefined) {
    return Boolean(selectedNode && window.Ext!.ComponentMgr.get(selectedNode.id));
  }
}

export const getComponent = (el: HTMLElement) => {
  const cmp = el.id && window.Ext?.ComponentMgr.all.map[el.id];

  if (cmp) {
    return extJSComponentToNode(cmp);
  }

  return null;
};

const extJSComponentToNodeWithChildren = (i: ExtJSComponent): ComponentNode => addChildren(extJSComponentToNode(i));

const extJSComponentToNode = (i: ExtJSComponent): ComponentNode => {
  return {
    id: i.id,
    type: types.get(i.constructor) || types.get(i.superclass().constructor) || '??',
    ctype: i.ctype,
    xtype: i.xtype,
    modal: Boolean(i.modal),
    component: i,
    children: [],
  };
};

const addChildren = (i: ComponentNode): ComponentNode => {
  const cmp = i.component;
  if (indexMap.has(cmp)) {
    i.children = indexMap.get(cmp)!.map(extJSComponentToNodeWithChildren);
  }
  return i;
};


