class Stack<T> {
  nodes: T[] = []; // nodes.length serves as top variable
  maxSize = 0;

  constructor(initialNodes: T[], size: number) {
    this.nodes = initialNodes;
    this.maxSize = size;
  }

  isEmpty() {
    return this.nodes.length === 0;
  }

  isFull() {
    return this.nodes.length >= this.maxSize;
  }

  push(value: T) {
    if (this.isFull()) {
      throw new Error("Overflow");
    }

    this.nodes[this.nodes.length] = value;
  }

  pop() {
    if (this.isEmpty()) {
      throw new Error("Underflow");
    }

    const returnValue = this.peek();
    this.nodes.length--;

    return returnValue;
  }

  peek() {
    return this.nodes[this.nodes.length - 1];
  }

  display() {
    let logValue = "";
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      logValue += `${node}${i === 0 ? "" : " --> "}`;
    }

    console.log(logValue || null);
  }
}

const word = "Hello there, Stack!";
const stack = new Stack(word.split(""), word.length);

let result = "";
for (const letter of word) {
  result += stack.pop();
}
console.log(result);
