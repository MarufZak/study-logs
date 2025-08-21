// Double Circular Linked List. Same as Double linked list, but last node's next element is reference for first node, and first node's prev element references to the last node.

type ListNode<T> = {
  prev: ListNode<T> | null;
  data: T;
  next: ListNode<T> | null;
};

class DoubleCircularLinkedList<T> {
  head: ListNode<T> | null = null;
  constructor(initialNodes?: T[]) {
    if (initialNodes && initialNodes.length > 0) {
      this.head = {
        prev: null,
        data: initialNodes[0],
        next: null,
      };

      let currNode = this.head;
      this.head.next = this.head; // make circular
      this.head.prev = this.head; // make circular

      for (let i = 1; i < initialNodes.length; i++) {
        currNode.next = {
          prev: currNode,
          data: initialNodes[i],
          next: null,
        };

        if (i === initialNodes.length - 1) {
          currNode.next.next = this.head;
          this.head.prev = currNode.next;
        }

        currNode = currNode.next;
      }
    }
  }

  push(value: T) {
    if (this.head === null) {
      this.head = {
        prev: null,
        data: value,
        next: null,
      };

      this.head.next = this.head; // make circular
      this.head.prev = this.head; // make circular
      return;
    }

    let currNode = this.head;
    const newNode: ListNode<T> = {
      prev: null,
      data: value,
      next: null,
    };

    while (currNode.next && currNode.next !== this.head) {
      currNode = currNode.next;
    }

    if (this.head) {
      this.head.prev = newNode;
      currNode.next = newNode;
      newNode.prev = currNode;
      newNode.next = this.head;
    }
  }

  pop() {
    if (this.head === null) {
      return;
    } else if (this.head.next === this.head) {
      this.head = null;
      return;
    }

    let currNode = this.head;

    while (currNode.next && currNode.next !== this.head) {
      currNode = currNode.next;
    }

    if (currNode.prev) {
      currNode.prev.next = this.head;
      this.head.prev = currNode.prev;
    }
  }

  shift() {
    if (this.head === null) {
      return;
    } else if (this.head.next === this.head) {
      this.head = null;
      return;
    }

    if (this.head.prev && this.head.next) {
      this.head.prev.next = this.head.next;
      this.head.next.prev = this.head.prev;
      this.head = this.head.next;
    }
  }

  unshift(value: T) {
    if (this.head === null) {
      this.push(value);
      return;
    }

    const newNode: ListNode<T> = {
      prev: this.head.prev,
      data: value,
      next: this.head,
    };

    if (this.head.prev && this.head.next) {
      this.head.prev.next = newNode;
      this.head.prev = newNode;
    }

    this.head = newNode;
  }

  reverse() {
    let currNode = this.head;
    let prevNode: ListNode<T> | null = null;

    while (currNode !== null) {
      if (prevNode) {
        prevNode.next;
      }

      prevNode = currNode;
      currNode = currNode.next;
    }
  }
}

const list = new DoubleCircularLinkedList<number>([1, 2, 3]);
