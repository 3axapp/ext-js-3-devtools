import {
  afterRenderEffect,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input, output,
  signal,
  viewChild,
} from '@angular/core';
import {FilterComponent} from './filter/filter.component';
import {DevToolsNode, ElementPath, Events} from '../../protocols/messages';
import {CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf} from '@angular/cdk/scrolling';
import {ComponentDataSource, UpdateResult} from './models/component.data-source';
import {FlatNode} from '../models/flat-node';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatIcon} from '@angular/material/icon';
import {IndexedNode} from './models/index-forest';
import {PortBus} from '../../protocols/port-bus';

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

  readonly itemHeight = 18;

  private readonly _messageBus = inject<PortBus<Events>>(PortBus);

  readonly selectNode = output<IndexedNode | null>();
  readonly setParents = output<FlatNode[] | null>();
  readonly selectDomElement = output<IndexedNode>();
  readonly highlightComponent = output<ElementPath>();
  readonly removeComponentHighlight = output<void>();
  readonly toggleInspector = output<void>();

  readonly forest = input<DevToolsNode[]>([]);

  private readonly updateForestResult = computed(() => this._updateForest(this.forest()));
  readonly treeControl = new FlatTreeControl<FlatNode>(
    (node) => node!.level,
    (node) => node.expandable,
  );
  readonly dataSource = new ComponentDataSource(this.treeControl);
  readonly viewport = viewChild.required<CdkVirtualScrollViewport>(CdkVirtualScrollViewport);
  private resizeObserver: ResizeObserver;
  private elementRef = inject(ElementRef);
  filterRegex = new RegExp('.^');
  currentlyMatchedIndex = -1;

  selectedNode: FlatNode | null = null;
  parents!: FlatNode[];

  private readonly highlightIDinTreeFromElement = signal<string | null>(null);


  constructor() {
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

    effect(() => {
      const result = this.updateForestResult();
      const changed =
        result.movedItems.length || result.newItems.length || result.removedItems.length;
      // if (this.currentSelectedElement() && changed) {
      //   this._reselectNodeOnUpdate();
      // }
    });
  }

  subscribeToInspectorEvents() {
    this._messageBus.on('selectComponent', (id) => {
      this.selectNodeByComponentId(id);
    });

    this._messageBus.on('highlightComponent', (id) => {
      this.highlightIDinTreeFromElement.set(id);
    });

    this._messageBus.on('removeComponentHighlight', () => {
      this.highlightIDinTreeFromElement.set(null);
    });
  }

  selectNodeByComponentId(id: string) {
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

    result.newItems.forEach((item) => this.treeControl.expand(item));

    return result;
  }

  get hasMatched(): boolean {
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

  nextMatched(): void {
    const indexesOfMatchedNodes = this._findMatchedNodes();
    this.currentlyMatchedIndex = (this.currentlyMatchedIndex + 1) % indexesOfMatchedNodes.length;
    const indexToSelect = indexesOfMatchedNodes[this.currentlyMatchedIndex];
    const nodeToSelect = this.dataSource.data[indexToSelect];
    if (indexToSelect !== undefined) {
      this.treeControl.expand(nodeToSelect);
      this.selectAndEnsureVisible(nodeToSelect);
    }
    const nodeIsVisible = this.dataSource.expandedDataValues.find((node) => node === nodeToSelect);
    if (!nodeIsVisible) {
      this.expandParents();
    }
  }

  prevMatched(): void {
    const indexesOfMatchedNodes = this._findMatchedNodes();
    this.currentlyMatchedIndex =
      (this.currentlyMatchedIndex - 1 + indexesOfMatchedNodes.length) %
      indexesOfMatchedNodes.length;
    const indexToSelect = indexesOfMatchedNodes[this.currentlyMatchedIndex];
    const nodeToSelect = this.dataSource.data[indexToSelect];
    if (indexToSelect !== undefined) {
      this.treeControl.expand(nodeToSelect);
      this.selectAndEnsureVisible(nodeToSelect);
    }
    const nodeIsVisible = this.dataSource.expandedDataValues.find((node) => node === nodeToSelect);
    if (!nodeIsVisible) {
      this.expandParents();
    }
  }

  expandParents(): void {
    this.parents.forEach((parent) => this.treeControl.expand(parent));
  }

  handleFilter(filterText: string): void {
    this.currentlyMatchedIndex = -1;

    try {
      this.filterRegex = new RegExp(filterText.toLowerCase() || '.^');
    } catch {
      this.filterRegex = new RegExp('.^');
    }
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  isMatched(node: FlatNode): boolean {
    return this.filterRegex.test(node.name.toLowerCase());
  }

  isSelected(node: FlatNode): boolean {
    return this.selectedNode?.id === node.id;
  }

  isHighlighted(node: FlatNode): boolean {
    return this.highlightIDinTreeFromElement() === node.id;
  }

  selectAndEnsureVisible(node: FlatNode): void {
    this.select(node);

    const scrollParent = this.viewport().elementRef.nativeElement;
    // The top most point we see an element
    const top = scrollParent.scrollTop;
    // That's the bottom most point we currently see an element.
    const parentHeight = scrollParent.offsetHeight;
    const bottom = top + parentHeight;
    const idx = this.dataSource.expandedDataValues.findIndex((el) => el.id === node.id);
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


  select(node: FlatNode): void {
    this.populateParents(node.path);
    this.selectNode.emit(node.original);
    this.selectedNode = node;
  }

  private populateParents(path: ElementPath): void {
    this.parents = [];
    for (let i = 1; i <= path.length; i++) {
      const current = path.slice(0, i);
      const selectedNode = this.dataSource.data.find(
        (item) => item.path.toString() === current.toString(),
      );

      // We might not be able to find the parent if the user has hidden the comment nodes.
      if (selectedNode) {
        this.parents.push(selectedNode);
      }
    }
    this.setParents.emit(this.parents);
  }

  handleSelectDomElement(node: FlatNode): void {
    this.selectDomElement.emit(node.original);
  }

  highlightNode(position: ElementPath): void {
    this.highlightIDinTreeFromElement.set(null);
    this.highlightComponent.emit(position);
  }

  removeHighlight(): void {
    this.removeComponentHighlight.emit();
  }

  handleSelect(node: FlatNode): void {
    this.currentlyMatchedIndex = this.dataSource.data.findIndex(
      (matchedNode) => matchedNode.id === node.id,
    );
    this.selectAndEnsureVisible(node);
  }

  public highlightNodeByComponentId(id: string) {
    const foundNode = this.findComponent(id);
    if (foundNode) {
      this.highlightIDinTreeFromElement.set(id);
    }

    return foundNode;
  }

  private findComponent(id: string) {
    return this.dataSource.data.find((node) => node.id === id);
  }
}
