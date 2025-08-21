class CircularQueue<T> {
  nodes: (T | null)[] = [];
  front = -1;
  rear = -1;
  maxSize = 0;

  constructor(initialNodes: T[], size: number) {
    this.maxSize = size;
    this.nodes = Array(size).fill(null);

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

    this.rear = (this.rear + 1) % this.maxSize;
    this.nodes[this.rear] = value;
  }

  dequeue() {
    if (this.isEmpty()) {
      throw new Error("Underflow");
    } else if (this.front === this.rear) {
      this.nodes[this.front] = null;
      this.front = this.rear = -1;
    } else {
      this.nodes[this.front] = null;
      this.front = (this.front + 1) % this.maxSize;
    }
  }

  isEmpty() {
    return this.front === -1 && this.rear === -1;
  }

  isFull() {
    return this.front === (this.rear + 1) % this.maxSize;
  }
}

const q = new CircularQueue([1, 2, 3], 5);
q.enqueue(4);
q.enqueue(5);
q.dequeue();
q.dequeue();
q.enqueue(6);
q.enqueue(7);
q.dequeue();
q.dequeue();
q.dequeue();
q.dequeue();
q.dequeue();
q.enqueue(1);
console.log(q.nodes);
console.log(`front: ${q.front}, rear: ${q.rear}`);
