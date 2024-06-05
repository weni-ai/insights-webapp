export function createRequestQuery(params, initialParams = {}) {
  if (Object.keys(params).length === 0) return initialParams;

  Object.entries(params).forEach(([key, value]) => {
    if (value && !Array.isArray(value) && typeof value === 'object') {
      Object.entries(value).forEach(([k, v]) => {
        initialParams[`${key}${k}`] = v;
      });
    } else {
      initialParams[key] = value;
    }
  });

  return initialParams;
}
