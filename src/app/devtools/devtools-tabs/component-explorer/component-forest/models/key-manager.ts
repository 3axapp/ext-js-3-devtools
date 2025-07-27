import {FlatTreeControl} from '@angular/cdk/tree';
import {FlatNode} from '../../models/flat-node';
import {ComponentDataSource} from './component.data-source';

export class KeyManager {
  private selectedNode!: FlatNode | null;

  public constructor(
    private treeControl: FlatTreeControl<FlatNode, FlatNode>,
    private dataSource: ComponentDataSource,
  ) {}

  public onKeyDown(selectedNode: FlatNode | null, $event: KeyboardEvent): FlatNode | null {
    this.selectedNode = selectedNode;
    this.preventDefault($event);
    switch ($event.code) {
      case 'KeyW':
      case 'ArrowUp':
        return this.selectPrevious();

      case 'KeyA':
      case 'ArrowLeft':
        return this.collapseOrSelectParent();

      case 'KeyS':
      case 'ArrowDown':
        return this.selectNext();

      case 'KeyD':
      case 'ArrowRight':
        return this.extractOrSelectNext();
    }
    return null;
  }

  private extractOrSelectNext() {
    if (!this.selectedNode) {
      return null;
    }
    if (!this.treeControl.isExpanded(this.selectedNode)) {
      this.treeControl.expand(this.selectedNode);
      return null;
    }
    return this.selectNext();
  }

  private selectPrevious() {
    if (!this.selectedNode) {
      return this.getFirstNode();
    }
    return this.dataSource.expandedDataValues[this.dataSource.expandedDataValues.indexOf(this.selectedNode) - 1];
  }

  private selectNext() {
    if (!this.selectedNode) {
      return this.getFirstNode();
    }
    return this.dataSource.expandedDataValues[this.dataSource.expandedDataValues.indexOf(this.selectedNode) + 1];
  }

  private selectParent() {
    let index = this.treeControl.dataNodes.indexOf(this.selectedNode!);
    let node;
    do {
      index--;
      node = this.treeControl.dataNodes[index];
    } while (node && node.level >= this.selectedNode!.level);
    return node;
  }

  private preventDefault($event: KeyboardEvent) {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes($event.code)) {
      $event.preventDefault();
    }
  }

  private collapseOrSelectParent() {
    if (!this.selectedNode) {
      return null;
    }
    if (this.treeControl.isExpandable(this.selectedNode) && this.treeControl.isExpanded(this.selectedNode)) {
      this.treeControl.collapse(this.selectedNode);
      return null;
    }
    return this.selectParent();
  }

  private getFirstNode() {
    return this.dataSource.expandedDataValues[0];
  }
}
