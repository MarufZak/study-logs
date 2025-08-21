class Queue<T> {
  maxSize = 0;
  front = -1;
  rear = -1;
  nodes = {};

  constructor(initialNodes: T[], size: number) {
    this.maxSize = size;
    for (let i = 0; i < initialNodes.length; i++) {
      this.enqueue(initialNodes[i]);
    }
  }

  enqueue(value: T) {
    if (this.isFull()) {
      throw new Error("Overflow");
    } else if (this.isEmpty()) {
      this.front = 0;
    }

    this.rear++;
    this.nodes[this.rear] = value;
  }

  dequeue() {
    if (this.isEmpty()) {
      throw new Error("Underflow");
    }

    delete this.nodes[this.front];

    if (this.front === this.rear) {
      this.front = this.rear = -1;
    } else {
      this.front++;
    }
  }

  isEmpty() {
    return this.front === -1 && this.rear === -1;
  }

  isFull() {
    return this.rear === this.maxSize - 1;
  }
}

const queue = new Queue<number>([1, 2, 3], 5);
queue.enqueue(4);
queue.enqueue(5);
queue.dequeue();
queue.dequeue();
queue.dequeue();
queue.dequeue();
queue.enqueue(6);
console.log(queue.nodes);
