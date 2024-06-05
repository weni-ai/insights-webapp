export function sortByKey(arr, key) {
  return arr.sort(function (a, b) {
    return a[key].localeCompare(b[key]);
  });
}
