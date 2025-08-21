function selectionSort(array: number[]) {
  let border = 0;

  for (let x = 0; x < array.length - 1; x++) {
    let leastElementIndex = border;
    for (let i = border + 1; i < array.length; i++) {
      if (array[i] < array[leastElementIndex]) {
        leastElementIndex = i;
      }
    }

    let temp = array[border];
    array[border] = array[leastElementIndex];
    array[leastElementIndex] = temp;
    border++;
  }
}
