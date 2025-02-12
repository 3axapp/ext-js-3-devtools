import {ElementPath} from '../app/protocols/messages';

export interface ComponentNode {
  id: string,
  type: string,
  ctype: string,
  xtype?: string,
  name?: string,
  modal: boolean,
  component: Ext.Component,
  children: ComponentNode[],
}

export const queryDirectiveForest = (
  position: ElementPath,
  forest: ComponentNode[],
): ComponentNode | null => {
  if (!position.length) {
    return null;
  }
  let node: null | ComponentNode = null;
  for (const i of position) {
    node = forest[i];
    if (!node) {
      return null;
    }
    forest = node.children;
  }
  return node;
};
