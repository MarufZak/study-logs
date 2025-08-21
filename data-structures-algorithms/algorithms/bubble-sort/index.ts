function bubbleSort(array: number[]) {
  for (let i = 0; i < array.length - 1; i++) {
    for (let x = 0; x < array.length - 1 - i; x++) {
      if (array[x] > array[x + 1]) {
        let temp = array[x];
        array[x] = array[x + 1];
        array[x + 1] = temp;
      }
    }
  }
}
