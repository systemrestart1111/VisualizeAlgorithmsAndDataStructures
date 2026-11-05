const rotateRight = (x) => { const y = x.left; x.left = y.right; y.right = x; return y; };
const rotateLeft = (x) => { const y = x.right; x.right = y.left; y.left = x; return y; };

// 把 k 轉到根；k 不存在時，轉上來的是搜尋路徑上最後一個節點
function splay(r, k) {
  if (!r || r.val === k) return r;
  if (k < r.val) {
    if (!r.left) return r;
    if (k < r.left.val) { // Zig-Zig（左左）：先轉祖父
      r.left.left = splay(r.left.left, k);
      r = rotateRight(r);
    } else if (k > r.left.val) { // Zig-Zag（左右）
      r.left.right = splay(r.left.right, k);
      if (r.left.right) r.left = rotateLeft(r.left);
    }
    return r.left ? rotateRight(r) : r;
  }
  if (!r.right) return r;
  if (k > r.right.val) { // Zig-Zig（右右）
    r.right.right = splay(r.right.right, k);
    r = rotateLeft(r);
  } else if (k < r.right.val) { // Zig-Zag（右左）
    r.right.left = splay(r.right.left, k);
    if (r.right.left) r.right = rotateRight(r.right);
  }
  return r.right ? rotateLeft(r) : r;
}

// 每次存取後都把該節點轉到根；不存任何平衡資訊，均攤 O(log n)
class SplayTree {
  constructor() { this.root = null; }
  insert(k) {
    const node = () => ({ val: k, left: null, right: null });
    if (!this.root) { this.root = node(); return; }
    let cur = this.root;
    while (k !== cur.val) { // 先做一般 BST 插入
      let nxt = k < cur.val ? cur.left : cur.right;
      if (!nxt) {
        nxt = node();
        if (k < cur.val) cur.left = nxt; else cur.right = nxt;
      }
      cur = nxt;
    }
    this.root = splay(this.root, k);
  }
  search(k) {
    this.root = splay(this.root, k);
    return !!this.root && this.root.val === k;
  }
  delete(k) {
    if (!this.search(k)) return false;
    if (!this.root.left) this.root = this.root.right;
    else {
      const right = this.root.right;
      this.root = splay(this.root.left, k); // 左子樹最大值轉到根，它沒有右子
      this.root.right = right;
    }
    return true;
  }
}

// 括號表示法：值(左子樹,右子樹)，空子樹寫成 -
function fmt(n) {
  if (!n) return '-';
  if (!n.left && !n.right) return String(n.val);
  return `${n.val}(${fmt(n.left)},${fmt(n.right)})`;
}

const b = (x) => (x ? 'True' : 'False');

const t = new SplayTree();
for (const v of [50, 30, 70, 20, 40, 60, 80]) { t.insert(v); console.log(`insert ${v}: ${fmt(t.root)}`); }
for (const v of [40, 65]) { const f = t.search(v); console.log(`search ${v} -> ${b(f)}: ${fmt(t.root)}`); }
for (const v of [30, 99]) { const ok = t.delete(v); console.log(`delete ${v} -> ${b(ok)}: ${fmt(t.root)}`); }
