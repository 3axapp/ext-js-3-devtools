import {Component, inject, output, signal, viewChild} from '@angular/core';
import {SplitAreaComponent, SplitComponent} from 'angular-split';
import {FlatNode} from './models/flat-node';
import {FlatNode as PropertyFlatNode, Property} from './properties/properties';
import {BreadcrumbsComponent} from './breadcrumbs/breadcrumbs.component';
import {ComponentForestComponent} from './component-forest/component-forest.component';
import {
  ComponentExplorerView,
  ComponentExplorerViewQuery,
  ComponentProperties,
  DevToolsNode,
  ElementPath,
  Events,
  PropType,
} from '../../../protocols/messages';
import {PropertiesComponent} from './properties/properties.component';
import {IndexedNode} from './component-forest/models/index-forest';
import {PortBus} from '../../../protocols/port-bus';


@Component({
  selector: 'app-component-explorer',
  imports: [
    SplitComponent,
    SplitAreaComponent,
    BreadcrumbsComponent,
    ComponentForestComponent,
    PropertiesComponent
],
  templateUrl: './component-explorer.component.html',
  standalone: true,
  styleUrl: './component-explorer.component.scss',
})
export class ComponentExplorerComponent {
  readonly toggleInspector = output<void>();
  readonly selectComponent = output<void>();

  readonly splitDirection = signal<'horizontal' | 'vertical'>('horizontal');

  readonly forest = signal<DevToolsNode[]>([]);
  readonly parents = signal<FlatNode[] | null>(null);
  readonly componentForest = viewChild.required(ComponentForestComponent);
  readonly currentSelectedElement = signal<IndexedNode | null>(null);
  readonly properties = signal<ComponentProperties | null>(null);

  private _clickedElement: IndexedNode | null = null;
  private readonly _messageBus = inject<PortBus<Events>>(PortBus);

  constructor() {
    this.subscribeToBackendEvents();
    this.refresh();
  }

  handleSetParents(parents: FlatNode[] | null): void {
    this.parents.set(parents);
  }

  handleNodeSelection(node: IndexedNode | null): void {
    if (node) {
      this._clickedElement = node;
      this._messageBus.emit('setSelectedComponent', node.path);
      this.refresh();
    } else {
      this._clickedElement = null;
      this.currentSelectedElement.set(null);
    }
  }

  highlightComponent(path: ElementPath): void {
    this._messageBus.emit('createHighlightOverlay', path);
  }

  removeComponentHighlight(): void {
    this._messageBus.emit('removeHighlightOverlay');
  }

  handleSelect(node: FlatNode): void {
    this.componentForest()?.handleSelect(node);
  }

  private subscribeToBackendEvents() {
    this._messageBus.on('latestComponentExplorerView', (view: ComponentExplorerView) => {
      this.forest.set(view.forest);
      this.currentSelectedElement.set(this._clickedElement);
      if (view.properties && this._clickedElement) {
        this.properties.set(view.properties);
      } else {
        this.properties.set(null);
      }
    });
  }

  private refresh() {
    this._messageBus.emit('getLatestComponentExplorerView', this._constructViewQuery());
  }

  private _constructViewQuery(): ComponentExplorerViewQuery | undefined {
    if (!this._clickedElement) {
      return;
    }
    return {
      selectedElement: this._clickedElement.path,
    };
  }

  inspect($event: { node: PropertyFlatNode; componentPath: ElementPath, parents?: string[] }) {
    if ($event.node.prop?.descriptor.type == PropType.Component) {
      this.componentForest()?.selectNodeByComponentId($event.node.prop.descriptor.value);
      return;
    }

    let t: DevToolsNode = {children: this.forest()} as any;
    for (let i of $event.componentPath) {
      t = t.children[i];
    }
    const propertyPath: string[] = [];
    let node: Property | null = $event.node.prop;
    while (node) {
      propertyPath.push(node.name);
      node = node.parent;
    }
    const strPath = this.preparePropertyPathForInspect($event.parents, propertyPath)
      .map(i => String(+i) === String(i) ? `[${i}]` : `.${i}`)
      .join('');
    const script = `inspect(Ext.getCmp("${t.id}")${strPath})`;
    chrome.devtools.inspectedWindow.eval(script);
  }

  highlightPropertyComponent($event: { node: PropertyFlatNode; componentPath: ElementPath, parents?: string[] }) {
    if ($event.node.prop?.descriptor.type != PropType.Component) {
      return;
    }

    const foundNode = this.componentForest()?.highlightNodeByComponentId($event.node.prop.descriptor.value);
    if (!foundNode) {
      return;
    }

    this.highlightComponent(foundNode.path);
  }

  private preparePropertyPathForInspect(parents: string[] | undefined, propertyPath: string[]) {
    if (parents && parents[0] == 'listeners') {
      return ['events', propertyPath[1], 'listeners', propertyPath[0], 'fn'];
    }
    return (parents || []).concat(propertyPath.reverse());
  }
}
