import {
  afterRenderEffect,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {FilterComponent} from './filter/filter.component';
import {DevToolsNode, ElementPath, Events} from '../../../../protocols/messages';
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {ComponentDataSource, UpdateResult} from './models/component.data-source';
import {FlatNode} from '../models/flat-node';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatIcon} from '@angular/material/icon';
import {IndexedNode} from './models/index-forest';
import {PortBus} from '../../../../protocols/port-bus';
import {filterFactory} from './models/filters/filter-factory';
import {Filter} from './models/filters/filter';
import {DefaultFilter} from './models/filters/default.filter';
import {KeyManager} from './models/key-manager';

@Component({
  selector: 'app-component-forest',
  imports: [
    FilterComponent,
    CdkFixedSizeVirtualScroll,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    MatIcon,
  ],
  templateUrl: './component-forest.component.html',
  standalone: true,
  styleUrl: './component-forest.component.scss',
})
export class ComponentForestComponent {
  private _initialized = false;

  public readonly itemHeight = 18;

  private readonly _messageBus = inject<PortBus<Events>>(PortBus);

  public readonly selectNode = output<IndexedNode | null>();
  public readonly setParents = output<FlatNode[] | null>();
  public readonly selectDomElement = output<IndexedNode>();
  public readonly highlightComponent = output<ElementPath>();
  public readonly removeComponentHighlight = output<void>();
  public readonly toggleInspector = output<void>();

  public readonly forest = input<DevToolsNode[]>([]);

  // private readonly updateForestResult = computed(() => this._updateForest(this.forest()));
  public readonly treeControl = new FlatTreeControl<FlatNode>(
    node => node!.level,
    node => node.expandable,
  );
  public readonly dataSource = new ComponentDataSource(this.treeControl);
  private readonly viewport = viewChild.required<CdkVirtualScrollViewport>(CdkVirtualScrollViewport);
  private resizeObserver: ResizeObserver;
  private elementRef = inject(ElementRef);
  private filter: Filter = new DefaultFilter('.^');
  private currentlyMatchedIndex = -1;

  private selectedNode: FlatNode | null = null;
  private parents!: FlatNode[];

  private readonly highlightIDinTreeFromElement = signal<string | null>(null);
  private keyManager = new KeyManager(this.treeControl, this.dataSource);

  public constructor() {
    this.subscribeToInspectorEvents();
    afterRenderEffect(() => {
      // this._tabUpdate.tabUpdate();

      const viewport = this.viewport();
      viewport.scrollToIndex(0);
      viewport.checkViewportSize();
    });

    // In some cases there a height changes, we need to recalculate the viewport size.
    this.resizeObserver = new ResizeObserver(() => {
      this.viewport().scrollToIndex(0);
      this.viewport().checkViewportSize();
    });
    this.resizeObserver.observe(this.elementRef.nativeElement);

    // effect(() => {
    //   const result = this.updateForestResult();
    //   const changed =
    //     result.movedItems.length || result.newItems.length || result.removedItems.length;
    //   // if (this.currentSelectedElement() && changed) {
    //   //   this._reselectNodeOnUpdate();
    //   // }
    // });

    effect(() => {
      this._updateForest(this.forest());
    });
  }

  private subscribeToInspectorEvents() {
    this._messageBus.on('selectComponent', id => {
      this.selectNodeByComponentId(id);
    });

    this._messageBus.on('highlightComponent', id => {
      this.highlightIDinTreeFromElement.set(id);
    });

    this._messageBus.on('removeComponentHighlight', () => {
      this.highlightIDinTreeFromElement.set(null);
    });
  }

  public selectNodeByComponentId(id: string) {
    const foundNode = this.findComponent(id);
    if (foundNode) {
      this.handleSelect(foundNode);
    }
    this.toggleInspector.emit();
    this.expandParents();
  }

  private _updateForest(forest: DevToolsNode[]): UpdateResult {
    const result = this.dataSource.update(forest);

    if (!this._initialized && forest.length) {
      // нужно ли это если ниже идет расскрытие?
      this.treeControl.expandAll();
      this._initialized = true;
      // result.newItems.forEach((item) => (item.newItem = false));
    }

    result.newItems.forEach(item => this.treeControl.expand(item));

    return result;
  }

  public get hasMatched(): boolean {
    return this._findMatchedNodes().length > 0;
  }

  private _findMatchedNodes(): number[] {
    const indexesOfMatchedNodes: number[] = [];
    for (let i = 0; i < this.dataSource.data.length; i++) {
      if (this.isMatched(this.dataSource.data[i])) {
        indexesOfMatchedNodes.push(i);
      }
    }
    return indexesOfMatchedNodes;
  }

  public nextMatched(): void {
    const indexesOfMatchedNodes = this._findMatchedNodes();
    this.currentlyMatchedIndex = (this.currentlyMatchedIndex + 1) % indexesOfMatchedNodes.length;
    const indexToSelect = indexesOfMatchedNodes[this.currentlyMatchedIndex];
    const nodeToSelect = this.dataSource.data[indexToSelect];
    if (indexToSelect !== undefined) {
      this.treeControl.expand(nodeToSelect);
      this.selectAndEnsureVisible(nodeToSelect);
    }
    const nodeIsVisible = this.dataSource.expandedDataValues.find(node => node === nodeToSelect);
    if (!nodeIsVisible) {
      this.expandParents();
    }
  }

  public prevMatched(): void {
    const indexesOfMatchedNodes = this._findMatchedNodes();
    this.currentlyMatchedIndex =
      (this.currentlyMatchedIndex - 1 + indexesOfMatchedNodes.length) % indexesOfMatchedNodes.length;
    const indexToSelect = indexesOfMatchedNodes[this.currentlyMatchedIndex];
    const nodeToSelect = this.dataSource.data[indexToSelect];
    if (indexToSelect !== undefined) {
      this.treeControl.expand(nodeToSelect);
      this.selectAndEnsureVisible(nodeToSelect);
    }
    const nodeIsVisible = this.dataSource.expandedDataValues.find(node => node === nodeToSelect);
    if (!nodeIsVisible) {
      this.expandParents();
    }
  }

  private expandParents(): void {
    this.parents.forEach(parent => this.treeControl.expand(parent));
  }

  public handleFilter(filterText: string): void {
    this.currentlyMatchedIndex = -1;
    this.filter = filterFactory(filterText);
  }

  public stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  public isMatched(node: FlatNode): boolean {
    return this.filter.isMatched(node);
  }

  public isSelected(node: FlatNode): boolean {
    return this.selectedNode?.id === node.id;
  }

  public isHighlighted(node: FlatNode): boolean {
    return this.highlightIDinTreeFromElement() === node.id;
  }

  public selectAndEnsureVisible(node: FlatNode): void {
    this.select(node);

    const scrollParent = this.viewport().elementRef.nativeElement;
    // The top most point we see an element
    const top = scrollParent.scrollTop;
    // That's the bottom most point we currently see an element.
    const parentHeight = scrollParent.offsetHeight;
    const bottom = top + parentHeight;
    const idx = this.dataSource.expandedDataValues.findIndex(el => el.id === node.id);
    // The node might be hidden.
    if (idx < 0) {
      return;
    }
    const itemTop = idx * this.itemHeight;
    if (itemTop < top) {
      scrollParent.scrollTo({top: itemTop});
    } else if (bottom < itemTop + this.itemHeight) {
      scrollParent.scrollTo({top: itemTop - parentHeight + this.itemHeight});
    }
  }

  private select(node: FlatNode): void {
    this.populateParents(node.path);
    this.selectNode.emit(node.original);
    this.selectedNode = node;
  }

  private populateParents(path: ElementPath): void {
    this.parents = [];
    for (let i = 1; i <= path.length; i++) {
      const current = path.slice(0, i);
      const selectedNode = this.dataSource.data.find(item => item.path.toString() === current.toString());

      // We might not be able to find the parent if the user has hidden the comment nodes.
      if (selectedNode) {
        this.parents.push(selectedNode);
      }
    }
    this.setParents.emit(this.parents);
  }

  public handleSelectDomElement(node: FlatNode): void {
    this.selectDomElement.emit(node.original);
  }

  public highlightNode(position: ElementPath): void {
    this.highlightIDinTreeFromElement.set(null);
    this.highlightComponent.emit(position);
  }

  public removeHighlight(): void {
    this.removeComponentHighlight.emit();
  }

  public handleSelect(node: FlatNode): void {
    this.currentlyMatchedIndex = this.dataSource.data.findIndex(matchedNode => matchedNode.id === node.id);
    this.selectAndEnsureVisible(node);
  }

  public highlightNodeByComponentId(id: string) {
    const foundNode = this.findComponent(id);
    if (foundNode) {
      this.highlightIDinTreeFromElement.set(id);
    }

    return foundNode;
  }

  public keyDown($event: KeyboardEvent) {
    const node = this.keyManager.onKeyDown(this.selectedNode, $event);
    if (node) {
      this.selectAndEnsureVisible(node);
    }
  }

  private findComponent(id: string) {
    return this.dataSource.data.find(node => node.id === id);
  }
}
