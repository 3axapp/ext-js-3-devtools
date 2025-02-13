import {FlatTreeControl} from '@angular/cdk/tree';
import {FlatNode} from '../../models/flat-node';
import {ComponentDataSource} from './component.data-source';

export class KeyManager {
  private selectedNode!: FlatNode;

  public constructor(
    private treeControl: FlatTreeControl<FlatNode, FlatNode>,
    private dataSource: ComponentDataSource,
  ) {
  }

  public onKeyDown(selectedNode: FlatNode, $event: KeyboardEvent): FlatNode | null {
    this.selectedNode = selectedNode;
    switch ($event.code) {
      case 'KeyW':
      case 'ArrowUp':
        return this.selectPrevious();

      case 'KeyA':
      case 'ArrowLeft':
        if (this.treeControl.isExpandable(this.selectedNode) && this.treeControl.isExpanded(this.selectedNode)) {
          this.treeControl.collapse(this.selectedNode);
          return null;
        }
        return this.selectParent();

      case 'KeyS':
      case 'ArrowDown':
        return this.selectNext();

      case 'KeyD':
      case 'ArrowRight':
        if (!this.treeControl.isExpanded(this.selectedNode)) {
          this.treeControl.expand(this.selectedNode);
          return null;
        }
        return this.selectNext();
    }
    return null;
  }

  private selectPrevious() {
    return this.dataSource.expandedDataValues[this.dataSource.expandedDataValues.indexOf(this.selectedNode) - 1];
  }

  private selectNext() {
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
}
