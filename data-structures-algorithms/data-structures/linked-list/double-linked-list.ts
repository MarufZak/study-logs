// Doubly Linked List. Has prev and next node references.

type ListNode<T> = {
  prev: ListNode<T> | null;
  data: T;
  next: ListNode<T> | null;
};

export class DoubleLinkedList<T> {
  head: ListNode<T> | null = null;

  constructor(initialNodes?: T[]) {
    if (initialNodes && initialNodes.length > 0) {
      this.head = {
        prev: null,
        data: initialNodes[0],
        next: null,
      };
      let currNode = this.head;
      for (let i = 1; i < initialNodes.length; i++) {
        const newNode: ListNode<T> = {
          prev: currNode,
          data: initialNodes[i],
          next: null,
        };
        currNode.next = newNode;
        currNode = currNode.next;
      }
    }
  }

  push(value: T): T {
    let currNode = this.head;
    const newNode: ListNode<T> = {
      prev: null,
      data: value,
      next: null,
    };

    while (currNode && currNode.next !== null) {
      currNode = currNode.next;
    }

    if (currNode === null) {
      this.head = newNode;
    } else if (currNode.next === null) {
      newNode.prev = currNode;
      currNode.next = newNode;
    }

    return value;
  }

  pop(): T | null {
    let poppedValue: T | null = null;
    let currNode = this.head;
    while (currNode && currNode.next && currNode.next.next !== null) {
      currNode = currNode.next;
    }

    if (currNode?.next?.next === null) {
      poppedValue = currNode.next.data;
      currNode.next = null;
    } else if (currNode?.next === null) {
      poppedValue = currNode.data;
      this.head = null;
    }

    return poppedValue;
  }

  shift(): null | T {
    let deletedValue: null | T = null;
    if (this.head && this.head.next) {
      deletedValue = this.head.data;
      this.head.next.prev = null;
      this.head = this.head.next;
    } else {
      this.head = null;
    }

    return deletedValue;
  }

  unshift(value: T) {
    const newNode: ListNode<T> = {
      prev: null,
      data: value,
      next: this.head,
    };

    this.head = newNode;
  }

  insert(value: T, index: number) {
    let currIndex = 1;
    let currNode = this.head;
    const newNode: ListNode<T> = {
      prev: null,
      data: value,
      next: null,
    };

    if (index === 0) {
      this.unshift(value);
      return;
    }

    while (currNode && currNode.next) {
      if (currIndex === index) {
        break;
      }
      currNode = currNode.next;
    }

    if (currNode === null) {
      this.head = newNode;
    } else {
      newNode.prev = currNode;
      newNode.next = currNode.next;
      currNode.next = newNode;
    }
  }

  reverse() {
    let currNode = this.head;

    while (currNode !== null) {
      const nextNode = currNode.next;
      currNode.next = currNode.prev;
      currNode.prev = nextNode;

      if (currNode.prev === null) {
        this.head = currNode;
      }

      currNode = nextNode;
    }
  }
}

const list = new DoubleLinkedList([1, 2, 3]);
list.reverse();
console.log(list.head);
