import {FlatNode} from '../../../models/flat-node';

export interface Filter {
  isMatched(node: FlatNode): boolean;
}
