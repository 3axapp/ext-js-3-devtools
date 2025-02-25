import {DevToolsNode, ElementPath} from '../../../protocols/messages';

export const indexForest = (forest: DevToolsNode[]) => forest.map((node, position) => index(node, position));

export interface IndexedNode extends DevToolsNode {
  path: ElementPath,
  children: IndexedNode[],
}

function index(node: DevToolsNode, position: number, parents: ElementPath = []): IndexedNode {
  const path = parents.concat([position]);

  return {
    path,
    id: node.id,
    type: node.type,
    ctype: node.ctype,
    modal: node.modal,
    name: node.name,
    plugins: node.plugins,
    children: node.children.map((node, position) => index(node, position, path)),
  };
}

