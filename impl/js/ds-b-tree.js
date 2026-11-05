const T = 2; // 最小度數：每個節點 T-1 ~ 2T-1 個鍵（T = 2 即 2-3-4 樹）

const newNode = (leaf) => ({ keys: [], kids: [], leaf });
const nodeStr = (n) => `[${n.keys.join(' ')}]`;

// 所有葉節點在同一深度；往下插入時遇到滿節點就先分裂（預先分裂，不必回頭）
class BTree {
  constructor() { this.root = newNode(true); }
  split(x, i) {
    const y = x.kids[i], z = newNode(y.leaf);
    const mid = y.keys[T - 1]; // 中間鍵上移到父節點
    z.keys = y.keys.slice(T);
    y.keys = y.keys.slice(0, T - 1);
    if (!y.leaf) { z.kids = y.kids.slice(T); y.kids = y.kids.slice(0, T); }
    x.keys.splice(i, 0, mid);
    x.kids.splice(i + 1, 0, z);
  }
  insert(k) {
    if (this.root.keys.length === 2 * T - 1) { // 根滿了：樹長高一層
      const s = newNode(false);
      s.kids = [this.root];
      this.root = s;
      this.split(s, 0);
    }
    let x = this.root;
    while (!x.leaf) {
      let i = 0;
      while (i < x.keys.length && k > x.keys[i]) i++;
      if (x.kids[i].keys.length === 2 * T - 1) {
        this.split(x, i);
        if (k > x.keys[i]) i++;
      }
      x = x.kids[i];
    }
    let i = 0;
    while (i < x.keys.length && x.keys[i] < k) i++;
    x.keys.splice(i, 0, k);
  }
  search(k) {
    const path = [];
    for (let x = this.root; ;) {
      path.push(nodeStr(x));
      let i = 0;
      while (i < x.keys.length && k > x.keys[i]) i++;
      if (i < x.keys.length && x.keys[i] === k) return [true, path];
      if (x.leaf) return [false, path];
      x = x.kids[i];
    }
  }
  levels() {
    const out = [];
    for (let level = [this.root]; level.length; level = level.flatMap((n) => n.kids)) out.push(level);
    return out;
  }
}

// 逐層列出節點，層與層之間以 / 分隔
const show = (t) => t.levels().map((lvl) => lvl.map(nodeStr).join(' ')).join(' / ');

const t = new BTree();
for (const k of [10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 28]) {
  t.insert(k);
  console.log(`insert ${String(k).padStart(2)}: ${show(t)}`);
}
for (const k of [17, 13]) {
  const [found, path] = t.search(k);
  console.log(`search ${k}: ${found ? 'found' : 'not found'}, path ${path.join(' -> ')}`);
}
console.log('height =', t.levels().length);
