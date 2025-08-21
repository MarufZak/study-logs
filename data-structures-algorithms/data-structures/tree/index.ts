type TreeNode<T> = {
  node: T;
  left: TreeNode<T> | null;
  right: TreeNode<T> | null;
};

type PossibleNodePositions = "left" | "right";

class Tree<T> {
  root: TreeNode<T>;

  constructor(value: T) {
    this.root = {
      node: value,
      left: null,
      right: null,
    };
  }

  add(position: PossibleNodePositions, value: T) {}
}
