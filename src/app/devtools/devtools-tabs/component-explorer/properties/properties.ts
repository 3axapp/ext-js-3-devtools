import {Descriptor} from '../../../../protocols/messages';

export interface FlatNode {
  expandable: boolean;
  prop: Property;
  level: number;
}

export interface Property {
  name: string;
  descriptor: Descriptor;
  parent: Property | null;
}

export type PropsContainer = Record<string, Descriptor> | Descriptor[];

export const arrayifyProps = (props: PropsContainer, parent: Property | null = null): Property[] =>
  Object.entries(props)
    .map(([name, val]) => ({name, descriptor: val, parent}))
    .sort((a, b) => {
      const parsedA = parseInt(a.name, 10);
      const parsedB = parseInt(b.name, 10);

      if (isNaN(parsedA) || isNaN(parsedB)) {
        return a.name > b.name ? 1 : -1;
      }

      return parsedA - parsedB;
    });
