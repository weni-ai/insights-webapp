export function sortByKey(arr, key, order = 'asc') {
  const compareString = arr.every((item) => typeof item[key] === 'string');

  const sortedArr = [...arr].sort((a, b) => {
    if (compareString) {
      return a[key].localeCompare(b[key]);
    } else {
      return a[key] - b[key];
    }
  });

  return order === 'desc' ? sortedArr.reverse() : sortedArr;
}

export function compareEquals(arrBase, ...arr) {
  const arrBaseStringfy = JSON.stringify(arrBase);
  return arr.every((arrCheck) => arrBaseStringfy === JSON.stringify(arrCheck));
}
