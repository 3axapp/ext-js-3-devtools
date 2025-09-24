import {DefaultFilter} from './default.filter';
import {FlatNode} from '../../../models/flat-node';

export class IdFilter extends DefaultFilter {
  protected override getTestValue(node: FlatNode): string {
    return node.original.id;
  }
}
