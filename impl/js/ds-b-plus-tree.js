const M = 4; // 階數：節點的鍵數達到 M 就分裂

const newNode = (leaf) => ({ keys: [], kids: [], leaf, next: null });
const nodeStr = (n) => `[${n.keys.join(' ')}]`;

// 資料都在葉節點、內部節點只放索引鍵；葉節點以 next 串成串列，範圍查詢只需沿串列走
class BPlusTree {
  constructor() { this.root = newNode(true); }
  findLeaf(k) {
    let x = this.root;
    const path = [x];
    while (!x.leaf) {
      let i = 0;
      while (i < x.keys.length && k >= x.keys[i]) i++;
      x = x.kids[i];
      path.push(x);
    }
    return [x, path];
  }
  insert(k) {
    const [leaf, path] = this.findLeaf(k);
    if (leaf.keys.includes(k)) return;
    let i = 0;
    while (i < leaf.keys.length && leaf.keys[i] < k) i++;
    leaf.keys.splice(i, 0, k);
    let node = leaf, d = path.length - 1;
    while (node.keys.length >= M) {
      const nw = newNode(node.leaf), mid = Math.ceil(node.keys.length / 2);
      let up;
      if (node.leaf) { // 葉分裂：右半第一個鍵「複製」到父節點
        nw.keys = node.keys.splice(mid);
        nw.next = node.next;
        node.next = nw;
        up = nw.keys[0];
      } else { // 內部分裂：中間鍵「移動」到父節點
        up = node.keys[mid - 1];
        nw.keys = node.keys.splice(mid);
        node.keys.pop();
        nw.kids = node.kids.splice(mid);
      }
      if (d === 0) { // 分裂到根：樹長高一層
        this.root = newNode(false);
        this.root.keys = [up];
        this.root.kids = [node, nw];
        break;
      }
      const parent = path[d - 1], pi = parent.kids.indexOf(node);
      parent.keys.splice(pi, 0, up);
      parent.kids.splice(pi + 1, 0, nw);
      node = parent;
      d--;
    }
  }
  search(k) { return this.findLeaf(k)[0].keys.includes(k); }
  range(a, b) {
    const out = [];
    for (let x = this.findLeaf(a)[0]; x; x = x.next) {
      out.push(...x.keys.filter((k) => k >= a && k <= b));
      if (x.keys.length && x.keys[x.keys.length - 1] > b) break;
    }
    return out;
  }
  levels() {
    const out = [];
    for (let level = [this.root]; level.length; level = level.flatMap((n) => n.kids)) out.push(level);
    return out;
  }
  leaves() {
    let x = this.root;
    while (!x.leaf) x = x.kids[0];
    const out = [];
    for (; x; x = x.next) out.push(x);
    return out;
  }
}

const b = (x) => (x ? 'True' : 'False');

const t = new BPlusTree();
for (const k of [5, 15, 25, 35, 45, 10, 20, 30, 40, 50, 12, 28]) {
  t.insert(k);
  console.log(`insert ${String(k).padStart(2)}: ${t.levels().map((lvl) => lvl.map(nodeStr).join(' ')).join(' / ')}`);
}
console.log('leaves: ' + t.leaves().map(nodeStr).join(' -> '));
console.log(`search 28 -> ${b(t.search(28))}  search 33 -> ${b(t.search(33))}`);
console.log('range [12, 35]: ' + t.range(12, 35).join(' '));
