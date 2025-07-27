import {Descriptor, PropType} from '../../app/protocols/messages';
import {getPropType} from './prop-type';
import {createLevelSerializedDescriptor, createShallowSerializedDescriptor} from './serialized-descriptor-factory';
import {getKeys} from './object-utils';

export class StateSerializer {
  public serialize(instance: object): Record<string, Descriptor> {
    const result: Record<string, Descriptor> = {};
    getKeys(instance).forEach(prop => {
      result[prop] = levelSerializer(instance, prop, 0, 0);
    });
    return result;
  }
}

const MAX_LEVEL = 1;

function levelSerializer(
  instance: any,
  propName: string | number,
  currentLevel = 0,
  level = MAX_LEVEL,
  continuation = levelSerializer,
): Descriptor {
  const serializableInstance = instance[propName];
  const propData: PropertyData = {
    prop: serializableInstance,
    type: getPropType(serializableInstance),
  };

  switch (propData.type) {
    case PropType.Array:
    case PropType.Object:
      return createLevelSerializedDescriptor(instance, propName, propData, {level, currentLevel}, continuation);
    default:
      return createShallowSerializedDescriptor(instance, propName, propData);
  }
}

export interface CompositeType {
  type: Extract<PropType, NestedType>;
  prop: any;
}

export interface TerminalType {
  type: Exclude<PropType, NestedType>;
  prop: any;
}

export type PropertyData = TerminalType | CompositeType;
type NestedType = PropType.Array | PropType.Object;
