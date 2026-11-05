// 插入二元搜尋樹：小於往左、其餘往右
function insert(root, key) {
  if (!root) return { key, left: null, right: null };
  if (key < root.key) root.left = insert(root.left, key);
  else root.right = insert(root.right, key);
  return root;
}

// 中序走訪 BST 會得到遞增序列
function inorder(root, out) {
  if (!root) return;
  inorder(root.left, out);
  out.push(root.key);
  inorder(root.right, out);
}

const a = [50, 30, 70, 20, 40, 60, 80, 35, 65, 10, 45];
let root = null;
for (const x of a) root = insert(root, x);
const out = [];
inorder(root, out);
console.log(out.join(' '));
