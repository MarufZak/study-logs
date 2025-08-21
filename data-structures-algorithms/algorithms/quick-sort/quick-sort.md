### Quick sort notes.

1. This sorting algorithm uses the method "Divide and conquer". It divides the array into sub-arrays.
2. The backbone of this method is to take pivot element (it can be any), and arrange the array so the left side is less and right side is more than the pivot element. This is known as _partition_.
3. We have _start_ and _end_ vars, initially indicating start and end indexes of array. We start from _start_ var. If it is less or equal than the pivot, we increment the _start_ var and so on. If it is more, we go to the _end_ var. We compare with _end_ var with pivot, if it is more than pivot, we decrement the _end_, if it is less or equal to pivot we do next:
   if(_start_ is less than _end_){
   swap _start_ with _end_;
   continue;
   } else {
   swap the pivot element with _end_;
   break;
   }
4. Worst-case time complexity is O(n^2), average case is O(logN), best case is O(n).
5. It's neither adaptive nor stable.
