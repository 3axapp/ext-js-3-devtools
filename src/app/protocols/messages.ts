import {ParentClasses} from '../../page/dom-manager';

export interface DevToolsNode {
  id: string,
  type: string,
  ctype: string,
  xtype?: string,
  name?: string,
  modal: boolean,
  children: DevToolsNode[],
}

export type ElementPath = number[];

export interface ComponentExplorerViewQuery {
  selectedElement: ElementPath,
}

export interface ComponentExplorerView {
  forest: DevToolsNode[],
  properties?: ComponentProperties,
}

export interface ComponentProperties {
  properties: Properties,
  initialConfig: Properties,
  listeners: Properties,
  parentClasses: ParentClasses,
}

export interface Events extends Record<string, any> {
  contentScriptConnected: (frameId: number, name: string, url: string) => void;
  contentScriptDisconnected: (frameId: number, name: string, url: string) => void;
  enableFrameConnection: (frameId: number, tabId: number) => void;
  frameConnected: (frameId: number) => void;
  backendReady: () => void;
  shutdown: () => void;

  queryExtJSAvailability: () => void;
  extJSAvailability: (result: { exists: boolean }) => void;

  inspectorStart: () => void;
  inspectorEnd: () => void;

  highlightComponent: (id: string) => void;
  selectComponent: (id: string) => void;
  removeComponentHighlight: () => void;

  getLatestComponentExplorerView: (query?: ComponentExplorerViewQuery) => void;
  latestComponentExplorerView: (view: ComponentExplorerView) => void;
  setSelectedComponent: (path: ElementPath) => void;

  createHighlightOverlay: (path: ElementPath) => void;
  removeHighlightOverlay: () => void;

  getNestedProperties: (position: DirectivePosition, path: string[]) => void;
  nestedProperties: (position: DirectivePosition, data: Properties, path: string[]) => void;

}

export type Topic = keyof Events;

export interface Message<T, E extends keyof T = keyof T> {
  topic: E,
  source: string,
  args: Parameters<T[E]>
}

export type Parameters<F> = F extends (...args: infer T) => any ? T : never;
export type Unsubscriber = () => void;

export enum PropType {
  Number,
  String,
  Null,
  Undefined,
  Symbol,
  HTMLNode,
  Boolean,
  BigInt,
  Function,
  Object,
  Date,
  Array,
  Set,
  Map,
  Unknown,
  Component,
}

export interface Properties {
  props: { [name: string]: Descriptor };
}

export interface Descriptor {
  expandable: boolean;
  value?: any;
  editable: boolean;
  type: PropType;
  preview: string;
}

export interface DirectivePosition {
  element: ElementPath;
  directive?: number;
}
