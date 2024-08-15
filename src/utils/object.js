export function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
}

export function parseValue(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
export function stringifyValue(value) {
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return value;
}

export function clearDeepValues(obj) {
  if (!obj) return obj;

  function clearValue(value) {
    const clearValuesByTypeMap = {
      string: '',
      number: 0,
    };

    const haveValueTypeAtMap =
      Object.keys(clearValuesByTypeMap).includes(typeof value);

    return haveValueTypeAtMap
      ? clearValuesByTypeMap[typeof value]
      : clearDeepValues(value) || value;
  }

  return Object.entries(obj).reduce((acc, [key, value]) => {
    acc[key] = clearValue(value);
    return acc;
  }, {});
}

export function checkDeepEmptyValues(obj) {
  if (!obj) return true;

  function checkValue(value) {
    const clearValuesByTypeMap = {
      string: '',
      number: 0,
    };

    const haveValueTypeAtMap =
      Object.keys(clearValuesByTypeMap).includes(typeof value);

    if (haveValueTypeAtMap && value === clearValuesByTypeMap[typeof value]) {
      return true;
    }

    if (!haveValueTypeAtMap) {
      return checkDeepEmptyValues(value);
    }

    return false;
  }

  return Object.entries(obj).every(([_key, value]) => checkValue(value));
}

export function isObjectsEquals(obj1, obj2) {
  return stringifyValue(obj1) === stringifyValue(obj2);
}
