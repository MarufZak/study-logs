type ListNode<T> = {
  data: T;
  next: ListNode<T> | null;
};

class LinkedList<T> {
  head: null | ListNode<T> = null;
  constructor(initialNodes?: T[]) {
    if (initialNodes && initialNodes.length > 0) {
      this.head = {
        data: initialNodes[0],
        next: null,
      };
      let lastNode = this.head;
      for (let i = 1; i < initialNodes.length; i++) {
        lastNode.next = {
          data: initialNodes[i],
          next: null,
        };
        lastNode = lastNode.next;
      }
    }
  }

  unshift(newNode: T) {
    const newHead: ListNode<T> = {
      data: newNode,
      next: this.head,
    };
    this.head = newHead;
  }

  shift(): T | null {
    if (this.head === null) {
      return null;
    }
    const deletedNode = this.head;
    this.head = this.head.next;
    return deletedNode.data;
  }

  insert(value: T, index: number) {
    let currIndex = 1;
    let currNode = this.head;
    const newNode: ListNode<T> = {
      data: value,
      next: null,
    };

    if (index === 0) {
      this.unshift(value);
      return;
    }

    for (let i = 0; i < currIndex; i++) {
      if (currNode === null) {
        break;
      }

      if (currIndex === index) {
        newNode.next = currNode.next;
        currNode.next = newNode;
        return currNode.data;
      }

      currIndex++;
      currNode = currNode.next;
    }
  }

  pop(): null | T {
    let poppedValue: T | null = null;
    let currNode = this.head;

    while (currNode && currNode.next && currNode.next.next !== null) {
      currNode = currNode.next;
    }

    if (currNode === null) {
      return poppedValue;
    } else if (currNode.next === null) {
      this.head = null;
    } else if (currNode.next.next === null) {
      poppedValue = currNode.next.data;
      currNode.next = null;
    }

    return poppedValue;
  }

  push(value: T): T {
    let currNode = this.head;
    const newNode: ListNode<T> = {
      data: value,
      next: null,
    };

    while (currNode && currNode.next !== null) {
      currNode = currNode.next;
    }

    if (currNode === null) {
      this.head = newNode;
    } else {
      currNode.next = newNode;
    }

    return value;
  }

  reverse() {
    let prevNode: null | ListNode<T> = null;
    let currNode = this.head;

    while (currNode) {
      let temp = currNode.next;
      currNode.next = prevNode;
      prevNode = currNode;
      currNode = temp;

      if (temp?.next === null) {
        this.head = currNode;
      }
    }
  }
}

const list = new LinkedList([1, 2, 3]);
console.log(list.head);
