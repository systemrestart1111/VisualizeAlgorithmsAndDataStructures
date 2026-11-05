// 依層序插入，形狀維持完全二元樹；刪除時以最深最右的節點補位
class BinaryTree {
  constructor() { this.root = null; }
  levelOrder() {
    const out = [], q = this.root ? [this.root] : [];
    for (let h = 0; h < q.length; h++) {
      const n = q[h];
      out.push(n);
      if (n.left) q.push(n.left);
      if (n.right) q.push(n.right);
    }
    return out;
  }
  insert(v) {
    const node = (p) => ({ val: v, left: null, right: null, parent: p });
    if (!this.root) { this.root = node(null); return; }
    for (const n of this.levelOrder()) { // 第一個缺少子節點的位置
      if (!n.left) { n.left = node(n); return; }
      if (!n.right) { n.right = node(n); return; }
    }
  }
  delete(v) {
    const nodes = this.levelOrder();
    const target = nodes.find((n) => n.val === v);
    if (!target) return false;
    const deepest = nodes[nodes.length - 1], p = deepest.parent;
    target.val = deepest.val;
    if (!p) this.root = null;
    else if (p.right === deepest) p.right = null;
    else p.left = null;
    return true;
  }
}

const preorder = (n, out = []) => { if (n) { out.push(n.val); preorder(n.left, out); preorder(n.right, out); } return out; };
const inorder = (n, out = []) => { if (n) { inorder(n.left, out); out.push(n.val); inorder(n.right, out); } return out; };
const postorder = (n, out = []) => { if (n) { postorder(n.left, out); postorder(n.right, out); out.push(n.val); } return out; };

// 括號表示法：值(左子樹,右子樹)，空子樹寫成 -
function fmt(n) {
  if (!n) return '-';
  if (!n.left && !n.right) return String(n.val);
  return `${n.val}(${fmt(n.left)},${fmt(n.right)})`;
}

const show = (name, vals) => console.log(name.padEnd(10), vals.join(' '));

const t = new BinaryTree();
for (let v = 1; v <= 8; v++) t.insert(v);
console.log('insert 1..8: ' + fmt(t.root));
show('preorder:', preorder(t.root));
show('inorder:', inorder(t.root));
show('postorder:', postorder(t.root));
show('level:', t.levelOrder().map((n) => n.val));
t.delete(2);
console.log('delete 2: ' + fmt(t.root));
show('level:', t.levelOrder().map((n) => n.val));
