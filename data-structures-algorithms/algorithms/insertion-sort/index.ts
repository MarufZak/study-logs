function insertionSort(array: number[]) {
  let border = 1; // between sorted and unsorted sub-lists.
  while (border !== array.length) {
    const element = array[border];

    let currIndex = border;
    while (array[currIndex - 1] > element) {
      array[currIndex] = array[currIndex - 1];
      currIndex--;
    }
    array[currIndex] = element;
    border++;
  }
}
