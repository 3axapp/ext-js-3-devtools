import {Component, input, output} from '@angular/core';
import {MatTree, MatTreeNode, MatTreeNodeDef, MatTreeNodePadding} from '@angular/material/tree';
import {MatIcon} from '@angular/material/icon';
import {PropertyDataSource} from '../property-data-source';
import {FlatTreeControl} from '@angular/cdk/tree';
import {FlatNode} from '../properties';
import {PropertyPreviewComponent} from '../property-preview/property-preview.component';

@Component({
  selector: 'app-property-view-tree',
  imports: [
    MatTree,
    MatTreeNode,
    MatIcon,
    MatTreeNodePadding,
    MatTreeNodeDef,
    PropertyPreviewComponent
  ],
  templateUrl: './property-view-tree.component.html',
  standalone: true,
  styleUrl: './property-view-tree.component.scss'
})
export class PropertyViewTreeComponent {
  readonly dataSource = input.required<PropertyDataSource>();
  readonly treeControl = input.required<FlatTreeControl<FlatNode>>();
  readonly inspect = output<any>();
  readonly highlight = output<any>();
  readonly removeHighlight = output<any>();

  hasChild = (_: number, node: FlatNode): boolean => node.expandable;
  toggle(node: FlatNode): void {
    if (this.treeControl().isExpanded(node)) {
      this.treeControl().collapse(node);
      return;
    }
    this.expand(node);
  }

  expand(node: FlatNode): void {
    const {prop} = node;
    if (!prop.descriptor.expandable) {
      return;
    }
    this.treeControl().expand(node);
  }
}
