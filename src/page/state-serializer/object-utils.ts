export const getDescriptor = (instance: any, propName: string): PropertyDescriptor | undefined =>
  Object.getOwnPropertyDescriptor(instance, propName) ||
  Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), propName);

export function getKeys(obj: {}): string[] {
  if (!obj) {
    return [];
  }
  const properties = Object.getOwnPropertyNames(obj);

  // Object.getPrototypeOf can return null, on empty object without prototype for example
  const prototypeMembers = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(obj) ?? {});

  const ignoreList = ['__proto__'];
  const gettersAndSetters = Object.keys(prototypeMembers).filter((methodName) => {
    if (ignoreList.includes(methodName)) {
      return false;
    }
    const targetMethod = prototypeMembers[methodName];

    return targetMethod.get || targetMethod.set;
  });

  return properties.concat(gettersAndSetters);
}
