We cannot compare list and linked list, it depends on situation (size of array, requirements and etc);

## List vs Linked List.

1. Element access cost: O(1) - O(n);
2. Memory: List takes less memory for each node, but it's limited and has to be exact size. Linked list takes more memory space for each node, but can be dynamic in any size.
3. Time complexities: Array vs Linked list:
   1. Insertion/Deletion at the beginning: O(n) - O(1);
   2. Insertion/Deletion at the end: O(1) - O(n);
   3. Insertion/Deletion at i position: O(n) - O(n)
4. Array is random access data structure, you can access any element by passing an index. To compare, linked list is linear, which means you need to iterate over all elements if you want to access the last one.

The purpose of linked lists is to remove the drawback of arrays, which have an exact number of nodes inside. Because elements of an array are stored contiguously in memory, if the memory allocator puts a variable after the array in memory (`[1,2,3],3`), and you want to extend the array, you cannot do this because there is another byte allocated for another variable in memory. Linked lists solve this problem by making the next element of the array dynamic, so linked lists don't have a fixed length and can be any size. However, a drawback of linked lists is memory. Because we store the reference to the next element inside one node, we allocate more memory for the node.

There is a `HEAD` pointer in the linked list that points to the first node in the linked list. Another drawback of linked lists is that because data is not stored in a contiguous manner, we cannot access, say, the 4th element directly; we should check the nodes one by one. With arrays, we can instantly get the say 4th node.

**Time complexities (worst cases):**

- Get last element: Linked list: O(n), array: O(1)
- Insert/Delete node at the beginning: Linked list: O(1), array: O(n) (because all elements are shifted by 1)

> Should i modify an existing data structure, or create new instance of it and work with it in every function call? I don't know yet, but, in general, probably modifying an existing one, although it introduces some complexities.
