import {WindowBus} from './window-bus';
import {ComponentExplorerView, DevToolsNode, ElementPath, Events} from '../app/protocols/messages';
import {Detector, types} from './detector';
import {ComponentNode, queryDirectiveForest} from './forest';
import {ComponentInspector} from './component-inspector/component-inspector';
import {StateSerializer} from './state-serializer/state-serializer';
import {unHighlight} from './component-inspector/highlighter';
import {DevToolsConsole} from './dev-tools-console';

export class DomManager {
  private selectedNode?: ComponentNode;

  public constructor(
    private bus: WindowBus<Events>,
    private detector: Detector,
    private inspector: ComponentInspector,
    private devToolsConsole: DevToolsConsole,
    private stateSerializer: StateSerializer,
  ) {}

  public initialize() {
    this.initWindowEvents();
    this.initInspectorEvents();
    this.initDetectorEvents();
    this.initComplete();
  }

  private getLatestComponentExplorerView() {
    const forest = this.detector.buildForest();
    const view: ComponentExplorerView = {forest: forest.map(componentToDevTools)};
    if (this.selectedNode) {
      view.properties = {
        properties: {
          props: this.stateSerializer.serialize(this.selectedNode.component),
        },
        initialConfig: {
          props: this.stateSerializer.serialize(this.selectedNode.component.initialConfig),
        },
        listeners: {
          props: this.stateSerializer.serialize(this.collectListeners(this.selectedNode.component)),
        },
        parentClasses: this.collectParentClasses(this.selectedNode.component),
      };
    }
    this.bus.emit('latestComponentExplorerView', view);
  }

  private getComponent(path: ElementPath) {
    let n: ComponentNode = {children: this.detector.getForest()} as any;
    for (const i of path) {
      n = n.children[i];
    }

    return n;
  }

  private initWindowEvents() {
    this.bus.on('queryExtJSAvailability', () => {
      this.bus.emit('extJSAvailability', {exists: this.detector.detect()});
    });
    this.bus.on('getLatestComponentExplorerView', this.getLatestComponentExplorerView.bind(this));
    this.bus.on('setSelectedComponent', path => {
      this.selectedNode = this.getComponent(path);
      this.devToolsConsole.setReference(this.selectedNode.component);
    });

    this.bus.on('getNestedProperties', (position, propPath) => {
      const emitEmpty = () => this.bus.emit('nestedProperties', position, {props: {}}, propPath);
      const node = queryDirectiveForest(position.element, this.detector.getForest());
      if (!node) {
        return emitEmpty();
      }
      const current = node.component;
      if (!current) {
        return emitEmpty();
      }
      let data: any = current;
      if (this.isListenersProp(propPath)) {
        data = this.getNestedListenersProperties(current, propPath);
      } else {
        for (const prop of propPath) {
          data = data[prop];
          if (!data) {
            console.error('Cannot access the properties', propPath, 'of', node);
          }
        }
      }
      this.bus.emit('nestedProperties', position, {props: this.stateSerializer.serialize(data)}, propPath);
      return;
    });

    this.bus.on('inspectorStart', () => this.inspector.startInspecting());
    this.bus.on('inspectorEnd', () => this.inspector.stopInspecting());

    this.bus.on('createHighlightOverlay', path => {
      const component = this.getComponent(path);
      if (component) {
        this.inspector.highlightComponent(component);
      }
    });
    this.bus.on('removeHighlightOverlay', unHighlight);
    this.bus.on('shutdown', () => this.bus.destroy());
  }

  private initInspectorEvents() {
    this.inspector.on('componentSelect', component => this.bus.emit('selectComponent', component.id));
    this.inspector.on('componentEnter', component => this.bus.emit('highlightComponent', component.id));
    this.inspector.on('componentLeave', () => this.bus.emit('removeComponentHighlight'));
  }

  private initDetectorEvents() {
    this.detector.onChange(() => {
      if (!this.detector.has(this.selectedNode)) {
        this.selectedNode = void 0;
      }

      this.getLatestComponentExplorerView();
    });
  }

  private initComplete() {
    this.bus.emit('backendReady');
  }

  private collectListeners(component: Ext.Component): Listeners {
    const listeners: Record<string, Function[]> = {};

    for (const [name, value] of Object.entries(component.events)) {
      if (typeof value === 'boolean' || value.listeners.length === 0) {
        continue;
      }
      listeners[name] = [];
      for (const listener of value.listeners) {
        listeners[name].push(listener.fn);
      }
    }

    return listeners;
  }

  private collectParentClasses(component: Ext.Component): ParentClasses {
    const parents: string[] = [];
    let n = component;

    while (typeof n.superclass === 'function') {
      parents.push(types.get(n.superclass().constructor) || '??');
      n = n.superclass();
    }

    return parents;
  }

  private isListenersProp(propPath: string[]) {
    return propPath[0] === 'listeners';
  }

  private getNestedListenersProperties(component: Ext.Component, propPath: string[]) {
    const listenersCollection = component.events[propPath[1]];
    if (typeof listenersCollection === 'boolean') {
      return [];
    }
    return listenersCollection.listeners.map(i => i.fn);
  }
}

const componentToDevTools = (node: ComponentNode): DevToolsNode => ({
  id: node.id,
  type: node.type,
  ctype: node.ctype,
  xtype: node.xtype,
  name: node.name,
  modal: node.modal,
  children: node.children.map(componentToDevTools),
});

type Listeners = Record<string, Listener[]>;

interface Listener {}

export type ParentClasses = string[];
