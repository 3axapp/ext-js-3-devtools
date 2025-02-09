import {PropType} from '../../app/protocols/messages';

const commonTypes = {
  boolean: PropType.Boolean,
  bigint: PropType.BigInt,
  function: PropType.Function,
  number: PropType.Number,
  string: PropType.String,
  symbol: PropType.Symbol,
};


export const getPropType = (prop: unknown): PropType => {
  if (prop === undefined) {
    return PropType.Undefined;
  }
  if (prop === null) {
    return PropType.Null;
  }
  if (prop instanceof HTMLElement) {
    return PropType.HTMLNode;
  }
  const type = typeof prop;
  if (type in commonTypes) {
    return commonTypes[type as keyof typeof commonTypes];
  }
  if (type === 'object') {
    if (Array.isArray(prop)) {
      return PropType.Array;
    } else if (prop instanceof Set) {
      return PropType.Set;
    } else if (prop instanceof Map) {
      return PropType.Map;
    } else if (Object.prototype.toString.call(prop) === '[object Date]') {
      return PropType.Date;
    } else if (prop instanceof Node) {
      return PropType.HTMLNode;
    } else if (isComponentProp(prop)) {
      return PropType.Component;
    } else {
      return PropType.Object;
    }
  }
  return PropType.Unknown;
};

const isComponentProp = (prop: object) => {
  return window.Ext && prop instanceof Ext.Component;
};
