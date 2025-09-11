import {Component, inject, output, signal, viewChild} from '@angular/core';
import {SplitAreaComponent, SplitComponent} from 'angular-split';
import {FlatNode} from './models/flat-node';
import {Property} from './properties/properties';
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
import {InspectionData, PropertiesComponent} from './properties/properties.component';
import {IndexedNode} from './component-forest/models/index-forest';
import {PortBus} from '../../../protocols/port-bus';

@Component({
  selector: 'app-component-explorer',
  imports: [SplitComponent, SplitAreaComponent, BreadcrumbsComponent, ComponentForestComponent, PropertiesComponent],
  templateUrl: './component-explorer.component.html',
  standalone: true,
  styleUrl: './component-explorer.component.scss',
})
export class ComponentExplorerComponent {
  public readonly toggleInspector = output<void>();
  public readonly selectComponent = output<void>();

  protected readonly splitDirection = signal<'horizontal' | 'vertical'>('horizontal');

  protected readonly forest = signal<DevToolsNode[]>([]);
  protected readonly parents = signal<FlatNode[] | null>(null);
  private readonly componentForest = viewChild.required(ComponentForestComponent);
  protected readonly currentSelectedElement = signal<IndexedNode | null>(null);
  protected readonly properties = signal<ComponentProperties | null>(null);

  private _clickedElement: IndexedNode | null = null;
  private readonly _messageBus = inject<PortBus<Events>>(PortBus);

  public constructor() {
    this.subscribeToBackendEvents();
    this.refresh();
  }

  protected handleSetParents(parents: FlatNode[] | null): void {
    this.parents.set(parents);
  }

  protected handleNodeSelection(node: IndexedNode | null): void {
    if (node) {
      this._clickedElement = node;
      this._messageBus.emit('setSelectedComponent', node.path);
      this.refresh();
    } else {
      this._clickedElement = null;
      this.currentSelectedElement.set(null);
    }
  }

  protected highlightComponent(path: ElementPath): void {
    this._messageBus.emit('createHighlightOverlay', path);
  }

  protected removeComponentHighlight(): void {
    this._messageBus.emit('removeHighlightOverlay');
  }

  protected handleSelect(node: FlatNode): void {
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

  protected inspect($event: InspectionData) {
    if ($event.node.prop?.descriptor.type == PropType.Component) {
      this.componentForest()?.selectNodeByComponentId($event.node.prop.descriptor.value as string);
      return;
    }

    let t: Partial<DevToolsNode> = {children: this.forest()};
    for (const i of $event.componentPath) {
      t = t.children![i];
    }
    const propertyPath: string[] = [];
    let node: Property | null = $event.node.prop;
    while (node) {
      propertyPath.push(node.name);
      node = node.parent;
    }
    const strPath = this.preparePropertyPathForInspect($event.parents, propertyPath)
      .map(i => (String(+i) === String(i) ? `[${i}]` : `.${i}`))
      .join('');
    const script = `inspect(Ext.getCmp("${t.id}")${strPath})`;
    chrome.devtools.inspectedWindow.eval(script);
  }

  protected highlightPropertyComponent($event: InspectionData) {
    if ($event.node.prop?.descriptor.type != PropType.Component) {
      return;
    }

    const foundNode = this.componentForest()?.highlightNodeByComponentId($event.node.prop.descriptor.value as string);
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
