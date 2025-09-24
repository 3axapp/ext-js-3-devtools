import {Filter} from './filter';
import {IdFilter} from './id.filter';
import {NameFilter} from './name.filter';
import {DefaultFilter} from './default.filter';

export const filterFactory = (filterText: string): Filter => {
  const test: [string, typeof DefaultFilter][] = [
    ['#', IdFilter],
    ['name=', NameFilter],
  ];

  filterText = filterText.toLowerCase() || '.^';

  for (const [t, type] of test) {
    if (t == filterText.substring(0, t.length)) {
      return new type(filterText.substring(t.length));
    }
  }

  return new DefaultFilter(filterText);
};
