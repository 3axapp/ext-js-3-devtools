import {ElementPath} from '../../../../protocols/messages';
import {IndexedNode} from '../component-forest/models/index-forest';

export interface FlatNode {
  id:string,
  expandable: boolean,
  name: string,
  level: number,
  path: ElementPath,
  newItem?: boolean,
  original: IndexedNode,
}
