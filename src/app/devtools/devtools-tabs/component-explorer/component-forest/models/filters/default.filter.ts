import {Filter} from './filter';
import {FlatNode} from '../../../models/flat-node';

export class DefaultFilter implements Filter {
  private filterRegex: RegExp;

  public constructor(filterText: string) {
    try {
      this.filterRegex = new RegExp(filterText.toLowerCase() || '.^');
    } catch {
      this.filterRegex = new RegExp('.^');
    }
  }

  public isMatched(node: FlatNode): boolean {
    return this.filterRegex.test(this.getTestValue(node).toLowerCase());
  }

  protected getTestValue(node: FlatNode): string {
    return node.name;
  }

}
