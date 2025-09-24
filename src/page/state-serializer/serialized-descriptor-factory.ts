import {Descriptor, PropType} from '../../app/protocols/messages';
import {getDescriptor, getKeys} from './object-utils';
import {types} from '../detector';
import {
  CompositeType,
  Formatter,
  LevelSerializedDescriptor,
  SerializableFunction,
  Serializer,
  ShallowSerializedDescriptor,
  TerminalType,
} from './types';

export const createShallowSerializedDescriptor: ShallowSerializedDescriptor = (
  instance,
  propName,
  propData,
): Descriptor => {
  const {type} = propData;

  const descriptor = getDescriptor(instance, propName as string);
  const getterOrSetter: boolean = isGetterOrSetter(descriptor);

  const shallowSerializedDescriptor: Descriptor = {
    type,
    expandable: shallowPropTypeToTreeMetaData[type].expandable,
    editable: isEditable(descriptor, propName, propData, getterOrSetter),
    preview: getPreview(propData, getterOrSetter),
  };

  if (propData.prop !== undefined && serializable.has(type)) {
    shallowSerializedDescriptor.value = propData.prop;
  } else if (propData.type == PropType.Component) {
    shallowSerializedDescriptor.value = propData.prop.id;
  }

  return shallowSerializedDescriptor;
};

export const createLevelSerializedDescriptor: LevelSerializedDescriptor = (
  instance,
  propName,
  propData,
  levelOptions,
  continuation,
): Descriptor => {
  const {type, prop} = propData;

  const descriptor = getDescriptor(instance, propName as string);
  const getterOrSetter: boolean = isGetterOrSetter(descriptor);

  const levelSerializedDescriptor: Descriptor = {
    type,
    editable: false,
    expandable: !getterOrSetter && getKeys(prop).length > 0,
    preview: getPreview(propData, getterOrSetter),
  };

  if (levelOptions.level !== undefined && levelOptions.currentLevel < levelOptions.level) {
    const value = getLevelDescriptorValue(propData, levelOptions, continuation);
    if (value !== undefined) {
      levelSerializedDescriptor.value = value;
    }
  }

  return levelSerializedDescriptor;
};

const isGetterOrSetter = (descriptor?: PropertyDescriptor): boolean =>
  Boolean((descriptor?.set || descriptor?.get) && !('value' in descriptor));

const shallowPropTypeToTreeMetaData: Record<Exclude<PropType, NestedType>, {editable: boolean; expandable: boolean}> = {
  [PropType.String]: {
    editable: true,
    expandable: false,
  },
  [PropType.BigInt]: {
    editable: false,
    expandable: false,
  },
  [PropType.Boolean]: {
    editable: true,
    expandable: false,
  },
  [PropType.Number]: {
    editable: true,
    expandable: false,
  },
  [PropType.Date]: {
    editable: false,
    expandable: false,
  },
  [PropType.Null]: {
    editable: true,
    expandable: false,
  },
  [PropType.Undefined]: {
    editable: true,
    expandable: false,
  },
  [PropType.Symbol]: {
    editable: false,
    expandable: false,
  },
  [PropType.Function]: {
    editable: false,
    expandable: false,
  },
  [PropType.HTMLNode]: {
    editable: false,
    expandable: false,
  },
  [PropType.Unknown]: {
    editable: false,
    expandable: false,
  },
  [PropType.Set]: {
    editable: false,
    expandable: false,
  },
  [PropType.Map]: {
    editable: false,
    expandable: false,
  },
  [PropType.Component]: {
    editable: false,
    expandable: false,
  },
};
type NestedType = PropType.Array | PropType.Object;
const isEditable = (
  descriptor: PropertyDescriptor | undefined,
  propName: string | number | symbol,
  propData: TerminalType,
  isGetterOrSetter: boolean,
) => {
  if (typeof propName === 'symbol') {
    return false;
  }

  if (isGetterOrSetter) {
    return false;
  }

  if (descriptor?.writable === false) {
    return false;
  }

  return shallowPropTypeToTreeMetaData[propData.type].editable;
};
const getPreview = (propData: TerminalType | CompositeType, isGetterOrSetter: boolean) => {
  return !isGetterOrSetter
    ? typeToDescriptorPreview[propData.type](propData.prop)
    : typeToDescriptorPreview[PropType.Function]({name: ''});
};

const typeToDescriptorPreview: Formatter<string> = {
  [PropType.Array]: (prop: unknown[]) => `Array(${prop.length})`,
  [PropType.Set]: (prop: Set<unknown>) => `Set(${prop.size})`,
  [PropType.Map]: (prop: Map<unknown, unknown>) => `Map(${prop.size})`,
  [PropType.BigInt]: (prop: bigint) => truncate(prop.toString()),
  [PropType.Boolean]: (prop: boolean) => truncate(prop.toString()),
  [PropType.String]: (prop: string) => `"${prop}"`,
  [PropType.Function]: (prop: SerializableFunction) => `${prop.name}(...)`,
  [PropType.HTMLNode]: (prop: Node) => prop.constructor.name,
  [PropType.Component]: (prop: Ext.Component) =>
    types.get(prop.constructor) || types.get(prop.superclass().constructor) || '??',
  [PropType.Null]: () => 'null',
  [PropType.Number]: (prop: number) => parseInt(String(prop), 10).toString(),
  [PropType.Object]: (prop: object) => (getKeys(prop).length > 0 ? '{...}' : '{}'),
  [PropType.Symbol]: (symbol: symbol) => `Symbol(${symbol.description})`,
  [PropType.Undefined]: () => 'undefined',
  [PropType.Date]: (prop: unknown) => {
    if (prop instanceof Date) {
      return `Date(${prop.toISOString()})`;
    }
    return `${prop}`;
  },
  [PropType.Unknown]: () => 'unknown',
};

function truncate(str: string, max = 20): string {
  return str.length > max ? str.substring(0, max) + '...' : str;
}

const serializable = new Set<PropType>([
  PropType.Boolean,
  PropType.String,
  PropType.Null,
  PropType.Number,
  PropType.Object,
  PropType.Undefined,
  PropType.Unknown,
]);

interface LevelOptions {
  currentLevel: number;
  level?: number;
}

function getLevelDescriptorValue(propData: CompositeType, levelOptions: LevelOptions, continuation: Serializer) {
  const {type, prop} = propData;
  const {currentLevel, level} = levelOptions;
  const value = prop;

  switch (type) {
    case PropType.Array:
      return value.map((_, idx) => continuation(value, idx, currentLevel + 1, level));
    case PropType.Object:
      return getKeys(value).reduce(
        (accumulator, propName) => {
          accumulator[propName] = continuation(value, propName, currentLevel + 1, level);
          return accumulator;
        },
        {} as Record<string, Descriptor>,
      );
  }
}
