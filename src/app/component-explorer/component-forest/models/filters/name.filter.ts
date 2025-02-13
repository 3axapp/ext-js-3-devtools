import {DefaultFilter} from './default.filter';
import {FlatNode} from '../../../models/flat-node';

export class NameFilter extends DefaultFilter {
  protected override getTestValue(node: FlatNode): string {
    return node.original.name || '';
  }
}
