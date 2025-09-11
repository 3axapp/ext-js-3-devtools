import {Descriptor, PropType} from '../../app/protocols/messages';

export type CompositeType = {
  [K in PropType]: {
    type: K;
    prop: PropNativeTypeMap[K];
  };
}[NestedType];

export type TerminalType = {
  [K in PropType]: {
    type: K;
    prop: PropNativeTypeMap[K];
  };
}[Exclude<PropType, NestedType>];

export interface PropNativeTypeMap {
  [PropType.Number]: number;
  [PropType.String]: string;
  [PropType.Null]: null;
  [PropType.Undefined]: undefined;
  [PropType.Symbol]: symbol;
  [PropType.HTMLNode]: HTMLElement;
  [PropType.Boolean]: boolean;
  [PropType.BigInt]: bigint;
  [PropType.Function]: Function;
  [PropType.Object]: Record<string, never>;
  [PropType.Array]: never[];
  [PropType.Date]: Date;
  [PropType.Set]: Set<unknown>;
  [PropType.Map]: Map<unknown, unknown>;
  [PropType.Unknown]: unknown;
  [PropType.Component]: Ext.Component;
}

// export type PropertyData = TerminalType | CompositeType;
// type NestedType = PropType.Array | PropType.Object;

// export interface CompositeType {
//   type: Extract<PropType, NestedType>;
//   prop: any;
// }
//
// export interface TerminalType {
//   type: Exclude<PropType, NestedType>;
//   prop: any;
// }

export type PropertyData = TerminalType | CompositeType;
type NestedType = PropType.Array | PropType.Object;

type Serializer = (
  instance: any,
  propName: string | number,
  currentLevel?: number,
  level?: number,
  continuation?: Serializer,
) => Descriptor;

type LevelSerializedDescriptor = (
  instance: any,
  propName: string | number,
  propData: CompositeType,
  levelOptions: LevelOptions,
  continuation: Serializer,
) => Descriptor;

type ShallowSerializedDescriptor = (instance: any, propName: string | number, propData: TerminalType) => Descriptor;

export type Formatter<Result> = Record<PropType, (data: any) => Result>;

export type SerializableFunction = Function;
