// 左子樹 < 節點 < 右子樹；搜尋、插入、刪除都只沿一條路徑往下
class BST {
  constructor() { this.root = null; }
  insert(v) {
    const node = () => ({ val: v, left: null, right: null });
    if (!this.root) { this.root = node(); return; }
    let cur = this.root;
    while (v !== cur.val) {
      if (v < cur.val) { if (!cur.left) cur.left = node(); cur = cur.left; }
      else { if (!cur.right) cur.right = node(); cur = cur.right; }
    }
  }
  search(v) {
    const path = [];
    for (let c = this.root; c; c = v < c.val ? c.left : c.right) {
      path.push(c.val);
      if (v === c.val) return [true, path];
    }
    return [false, path];
  }
  minMax() {
    let lo = this.root, hi = this.root;
    while (lo.left) lo = lo.left;
    while (hi.right) hi = hi.right;
    return [lo.val, hi.val];
  }
  delete(v) { this.root = this.#deleteAt(this.root, v); }
  #deleteAt(n, v) {
    if (!n) return null;
    if (v < n.val) n.left = this.#deleteAt(n.left, v);
    else if (v > n.val) n.right = this.#deleteAt(n.right, v);
    else {
      if (!n.left) return n.right; // 葉節點或只有右子
      if (!n.right) return n.left;
      let s = n.right; // 兩個子節點：以中序後繼（右子樹最小值）取代
      while (s.left) s = s.left;
      n.val = s.val;
      n.right = this.#deleteAt(n.right, s.val);
    }
    return n;
  }
}

const inorder = (n, out = []) => { if (n) { inorder(n.left, out); out.push(n.val); inorder(n.right, out); } return out; };

// 括號表示法：值(左子樹,右子樹)，空子樹寫成 -
function fmt(n) {
  if (!n) return '-';
  if (!n.left && !n.right) return String(n.val);
  return `${n.val}(${fmt(n.left)},${fmt(n.right)})`;
}

const t = new BST();
for (const v of [50, 30, 70, 20, 40, 60, 80, 35, 65]) t.insert(v);
console.log('build: ' + fmt(t.root));
console.log('inorder: ' + inorder(t.root).join(' '));
for (const v of [65, 45]) {
  const [found, path] = t.search(v);
  console.log(`search ${v}: ${found ? 'found' : 'not found'}, path ${path.join(' -> ')}`);
}
const [lo, hi] = t.minMax();
console.log(`min = ${lo}, max = ${hi}`);
for (const [v, kind] of [[20, 'leaf'], [30, 'one child'], [50, 'two children']]) {
  t.delete(v);
  console.log(`delete ${v} (${kind}): ${fmt(t.root)}`);
}
console.log('inorder: ' + inorder(t.root).join(' '));
