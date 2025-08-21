import { swapArrayElements } from "./utils";

function quickSort(array: number[], lowerBound: number, upperBound: number) {
  if (lowerBound < upperBound) {
    const pivotIndex = partition(array, lowerBound, upperBound);
    quickSort(array, lowerBound, pivotIndex - 1);
    quickSort(array, pivotIndex + 1, upperBound);
  }
}

function partition(array: number[], lowerBound: number, upperBound: number) {
  let start = lowerBound;
  let end = upperBound;
  let pivot = lowerBound;

  while (start < end) {
    while (array[start] <= array[pivot]) {
      start++;
    }

    while (array[end] > array[pivot]) {
      end--;
    }

    if (start < end) {
      swapArrayElements(array, start, end);
    }
  }

  swapArrayElements(array, pivot, end);

  return end;
}

const arr = [7, 6, 10, 5, 9, 2, 1, 15, 7];
quickSort(arr, 0, arr.length - 1);
console.log(arr);
