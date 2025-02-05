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
} from '../protocols/messages';
import {PropertiesComponent} from './properties/properties.component';
import {IndexedNode} from './component-forest/models/index-forest';
import {PortBus} from '../protocols/port-bus';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-component-explorer',
  imports: [
    SplitComponent,
    SplitAreaComponent,
    BreadcrumbsComponent,
    ComponentForestComponent,
    PropertiesComponent,
    NgIf,
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

  // private _refreshRetryTimeout: null | ReturnType<typeof setTimeout> = null;

  constructor() {
    this.subscribeToBackendEvents();
    this.refresh();
  }

  handleSetParents(parents: FlatNode[] | null): void {
    this.parents.set(parents);
  }

  handleNodeSelection(node: IndexedNode | null): void {
    if (node) {
      // // We want to guarantee that we're not reusing any of the previous properties.
      // // That's possible if the user has selected an NgForOf and after that
      // // they select another NgForOf instance. In this case, we don't want to diff the props
      // // we want to render from scratch.
      // if (this._clickedElement && !sameDirectives(this._clickedElement, node)) {
      //   this._propResolver.clearProperties();
      // }
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
        // this._propResolver.setProperties(this._clickedElement, view.properties);
      } else {
        this.properties.set(null);
      }
    });
  }

  private refresh() {
    this._messageBus.emit('getLatestComponentExplorerView', this._constructViewQuery());
    // // this._messageBus.emit('getRoutes');
    // // If the event was not throttled, we no longer need to retry.
    // if (success) {
    //   this._refreshRetryTimeout && clearTimeout(this._refreshRetryTimeout);
    //   this._refreshRetryTimeout = null;
    //   return;
    // }
    // // If the event was throttled and we haven't scheduled a retry yet.
    // if (!this._refreshRetryTimeout) {
    //   this._refreshRetryTimeout = setTimeout(() => this.refresh(), 500);
    // }
    // // this.refreshHydrationNodeHighlightsIfNeeded();
  }

  private _constructViewQuery(): ComponentExplorerViewQuery | undefined {
    if (!this._clickedElement) {
      return;
    }
    return {
      selectedElement: this._clickedElement.path,
      // propertyQuery: this._getPropertyQuery(),
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
    const strPath = ($event.parents || []).concat(propertyPath.reverse())
      .map(i => String(+i) === String(i) ? `[${i}]` : `.${i}`)
      .join('');
    const script = `inspect(Ext.getCmp("${t.id}")${strPath})`;

    chrome.devtools.inspectedWindow.eval(script);
    // }
    // this._messageBus.emit('inspect', t.id, propertyPath.reverse().join('.'))
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
}
