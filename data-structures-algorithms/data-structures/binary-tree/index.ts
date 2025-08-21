type TreeNode<T> = {
  value: T;
  left: TreeNode<T> | null;
  right: TreeNode<T> | null;
};

class BinaryTree<T> {
  root: TreeNode<T> | null = null;

  constructor(rootValue: T) {
    this.root = { value: rootValue, left: null, right: null };
  }
}
