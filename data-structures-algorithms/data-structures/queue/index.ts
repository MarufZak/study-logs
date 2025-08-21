class Queue<T> {
  elements: T[] = [];
  rare = -1;
  front = -1;
  max = 0;

  constructor(initialElements: T[], size: number) {
    this.elements = initialElements;
    this.max = size;
    if (initialElements.length >= size) {
      throw new Error("Overflow");
    }

    if (initialElements.length > 0) {
      this.rare = initialElements.length - 1;
      this.front = 0;
    }
  }

  isEmpty(): boolean {
    return this.rare === -1 && this.front === -1;
  }

  isFull(): boolean {
    return this.max === this.elements.length;
  }

  enqueue(value: T): void {
    if (this.isFull()) {
      return;
    }

    if (this.isEmpty()) {
      this.rare = this.front = 0;
    } else {
      this.rare++;
    }

    this.elements[this.rare] = value;
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) {
      return;
    }

    this.front++;
  }

  display() {
    console.log(this.elements.slice(this.front));
  }
}

class CircularQueue<T> extends Queue<T> {
  elements: T[] = [];
  rare = -1;
  front = -1;
  max = 0;

  constructor(initialElements: T[], size: number) {
    super(initialElements, size);
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) {
      return;
    }

    if (this.front === 0 && this.rare === 0) {
      this.elements = [];
      this.front = this.rare = -1;
    } else {
      this.rare--;
      this.elements = this.elements.slice(this.front + 1);
    }
  }
}

const queue = new CircularQueue<number>([], 5);
