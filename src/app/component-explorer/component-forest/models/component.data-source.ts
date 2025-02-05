import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {FlatNode} from '../../models/flat-node';
import {FlatTreeControl} from '@angular/cdk/tree';
import {BehaviorSubject, map, merge, Observable} from 'rxjs';
import {DevToolsNode} from '../../../protocols/messages';
import {IndexedNode, indexForest} from './index-forest';
import {MatTreeFlattener} from '@angular/material/tree';
import {diff} from './diffing';
import {DefaultIterableDiffer, TrackByFunction} from '@angular/core';

export class ComponentDataSource extends DataSource<FlatNode> {

  private _differ = new DefaultIterableDiffer<FlatNode>(trackBy);
  private _expandedData = new BehaviorSubject<FlatNode[]>([]);
  private _flattenedData = new BehaviorSubject<FlatNode[]>([]);
  private _nodeToFlat = new WeakMap<IndexedNode, FlatNode>();

  private _treeFlattener = new MatTreeFlattener(
    (node: IndexedNode, level: number) => {
      if (this._nodeToFlat.has(node)) {
        return this._nodeToFlat.get(node);
      }
      const flatNode: FlatNode = {
        expandable: expandable(node),
        id: node.id,
        path: node.path,
        name: node.type,
        original: node,
        level,
      };
      this._nodeToFlat.set(node, flatNode);
      return flatNode;
    },
    (node) => (node ? node.level : -1),
    (node) => (node ? node.expandable : false),
    (node) => (node ? node.children : []),
  );

  constructor(private _treeControl: FlatTreeControl<FlatNode>) {
    super();
  }

  get data(): FlatNode[] {
    return this._flattenedData.value;
  }

  get expandedDataValues(): FlatNode[] {
    return this._expandedData.value;
  }

  getFlatNodeFromIndexedNode(indexedNode: IndexedNode): FlatNode | undefined {
    return this._nodeToFlat.get(indexedNode);
  }

  update(forest: DevToolsNode[]): UpdateResult {
    if (!forest.length) {
      return {newItems: [], movedItems: [], removedItems: []};
    }

    const flattenedCollection = this._treeFlattener.flattenNodes(indexForest(forest)) as FlatNode[];
    this.data.forEach((i) => (i.newItem = false));

    const expandedNodes: Record<string, boolean> = {};
    this.data.forEach((item) => {
      expandedNodes[item.id] = this._treeControl.isExpanded(item);
    });

    const {newItems, movedItems, removedItems} = diff<FlatNode>(
      this._differ,
      this.data,
      flattenedCollection,
    );
    this._treeControl.dataNodes = this.data;
    this._flattenedData.next(this.data);

    movedItems.forEach((i) => {
      this._nodeToFlat.set(i.original, i);
      if (expandedNodes[i.id]) {
        this._treeControl.expand(i);
      }
    });
    newItems.forEach((i) => (i.newItem = true));
    removedItems.forEach((i) => this._nodeToFlat.delete(i.original));

    return {newItems, movedItems, removedItems};
  }

  connect(collectionViewer: CollectionViewer): Observable<FlatNode[]> {
    const changes = [
      collectionViewer.viewChange,
      this._treeControl.expansionModel.changed,
      this._flattenedData,
    ];
    return merge<unknown[]>(...changes).pipe(
      map(() => {
        this._expandedData.next(
          this._treeFlattener.expandFlattenedNodes(
            this.data,
            this._treeControl as FlatTreeControl<FlatNode | undefined>,
          ) as FlatNode[],
        );
        return this._expandedData.value;
      }),
    );
  }

  disconnect(collectionViewer: CollectionViewer): void {
  }

}

export interface UpdateResult {
  newItems: FlatNode[],
  movedItems: FlatNode[],
  removedItems: FlatNode[],
}

const expandable = (node: IndexedNode) => node.children.length > 0;
const trackBy: TrackByFunction<FlatNode> = (_: number, item: FlatNode) => `${item.id}#${item.expandable}`;
