import {WindowBus} from './window-bus';
import {ComponentExplorerView, DevToolsNode, ElementPath, Events} from '../app/protocols/messages';
import {Detector} from './detector';
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
  ) {
  }

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
      };
    }
    this.bus.emit('latestComponentExplorerView', view);
  }

  private getComponent(path: ElementPath) {
    let n: ComponentNode = {children: this.detector.getForest()} as any;
    for (let i of path) {
      n = n.children[i];
    }

    return n;
  };

  private initWindowEvents() {
    this.bus.on('queryExtJSAvailability', () => {
      this.bus.emit('extJSAvailability', {exists: this.detector.detect()});
    });
    this.bus.on('getLatestComponentExplorerView', this.getLatestComponentExplorerView.bind(this));
    this.bus.on('setSelectedComponent', (path) => {
      this.selectedNode = this.getComponent(path);
      this.devToolsConsole.setReference(this.selectedNode.component);
    });

    this.bus.on('getNestedProperties', (position, propPath) => {
      const emitEmpty = () => this.bus.emit('nestedProperties', position, {props: {}}, propPath);
      const node = queryDirectiveForest(
        position.element,
        this.detector.getForest(),
      );
      if (!node) {
        return emitEmpty();
      }
      const current = node.component;
      if (!current) {
        return emitEmpty();
      }
      let data: any = current;
      for (const prop of propPath) {
        data = data[prop];
        if (!data) {
          console.error('Cannot access the properties', propPath, 'of', node);
        }
      }
      this.bus.emit('nestedProperties',
        position,
        {props: this.stateSerializer.serialize(data)},
        propPath,
      );
      return;
    });

    this.bus.on('inspectorStart', () => this.inspector.startInspecting());
    this.bus.on('inspectorEnd', () => this.inspector.stopInspecting());

    this.bus.on('createHighlightOverlay', (path) => {
      const component = this.getComponent(path);
      if (component) {
        this.inspector.highlightComponent(component);
      }
    });
    this.bus.on('removeHighlightOverlay', unHighlight);
    this.bus.on('shutdown', () => this.bus.destroy());
  }

  private initInspectorEvents() {
    this.inspector.on('componentSelect', (component) => this.bus.emit('selectComponent', component.id));
    this.inspector.on('componentEnter', (component) => this.bus.emit('highlightComponent', component.id));
    this.inspector.on('componentLeave', () => this.bus.emit('removeComponentHighlight'));
  }

  private initDetectorEvents() {
    this.detector.onChange(this.getLatestComponentExplorerView.bind(this));
  }

  private initComplete() {
    this.bus.emit('backendReady');
  }
}

const componentToDevTools = (node: ComponentNode): DevToolsNode => ({
  id: node.id,
  type: node.type,
  ctype: node.ctype,
  xtype: node.xtype,
  modal: node.modal,
  children: node.children.map(componentToDevTools),
});



