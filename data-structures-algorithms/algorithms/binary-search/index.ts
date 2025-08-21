function binarySearch<T>(array: T[], element: T) {
  let left = 0;
  let right = array.length - 1;

  while (left !== right) {
    const mid = Math.floor((left + right) / 2);
    if (element === array[mid]) {
      return mid;
    } else if (element < array[mid]) {
      right = mid - 1;
    } else if (element > array[mid]) {
      left = mid + 1;
    }
  }

  if (array[left] === element) {
    return left;
  }
  return 0;
}

console.log(binarySearch([1, 2, 3, 4, 5, 6, 7, 8], 4));
