// Circular Linked List. Same as single Linked List, but last pointer points to the HEAD;

type ListNode<T> = {
  data: T;
  next: ListNode<T> | null;
};

class CircularLinkedList<T> {
  head: null | ListNode<T> = null;
  constructor(initialNodes?: T[]) {
    if (initialNodes && initialNodes.length > 0) {
      let currNode: ListNode<T> = {
        data: initialNodes[0],
        next: null,
      };
      this.head = currNode;
      this.head.next = this.head;
      for (let i = 1; i < initialNodes.length; i++) {
        currNode.next = {
          data: initialNodes[i],
          next: initialNodes[i + 1] ? null : this.head,
        };
        currNode = currNode.next;
      }
    }
  }

  push(value: T) {
    let currNode = this.head;
    const newNode: ListNode<T> = {
      data: value,
      next: this.head,
    };

    while (currNode !== null) {
      if (currNode.next === this.head) {
        currNode.next = newNode;
        break;
      }

      currNode = currNode.next;
    }
  }

  pop() {
    let currNode = this.head;

    let prevNode: ListNode<T> | null = null;
    while (currNode !== null) {
      if (currNode.next !== this.head) {
        prevNode = currNode;
        currNode = currNode.next;
        continue;
      }

      if (prevNode) {
        prevNode.next = this.head;
      } else {
        this.head = null;
      }
      break;
    }
  }

  shift() {
    if (this.head === null) {
      return;
    }

    let newHead: ListNode<T> | null = this.head.next;
    if (newHead === this.head) {
      newHead = null;
    }

    let currNode = newHead;
    while (currNode !== null) {
      if (currNode.next === this.head) {
        currNode.next = newHead;
        break;
      }

      currNode = currNode.next;
    }

    this.head = this.head.next;
  }

  unshift(value: T) {
    let currNode = this.head;
    const newHead: ListNode<T> | null = {
      data: value,
      next: this.head,
    };

    while (currNode !== null) {
      if (currNode.next === this.head) {
        break;
      }

      currNode = currNode.next;
    }

    if (currNode) {
      currNode.next = newHead;
    }

    this.head = newHead;
  }

  insert(value: T, index: number) {
    let currIndex = 0;
    let currNode = this.head;
    let prevNode: typeof this.head = null;

    if (index === 0 || this.head === null) {
      this.unshift(value);
      return;
    }

    const newNode: ListNode<T> = {
      data: value,
      next: null,
    };

    while (currNode !== null) {
      if (currIndex !== index) {
        currIndex++;
        prevNode = currNode;
        currNode = currNode.next;
        continue;
      }

      if (prevNode) {
        prevNode.next = newNode;
        newNode.next = currNode;
      }

      break;
    }
  }

  reverse() {
    if (this.head?.next === this.head) {
      return;
    }

    let currNode = this.head;
    let prevNode: ListNode<T> | null = null;
    let toBreak = false;
    while (currNode !== null && toBreak === false) {
      if (this.head && currNode.next === this.head) {
        this.head.next = currNode;
        this.head = currNode;
        toBreak = true;
      }

      const tempNode = currNode.next;
      currNode.next = prevNode;

      prevNode = currNode;
      currNode = tempNode;
    }
  }
}
