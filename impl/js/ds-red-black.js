// CLRS 版本：以一個黑色哨兵 NIL 代替所有空指標，插入後以「變色 + 旋轉」修復
class RedBlackTree {
  constructor() {
    this.NIL = { val: null, red: false };
    this.NIL.left = this.NIL.right = this.NIL.parent = this.NIL;
    this.root = this.NIL;
  }
  rotateLeft(x) {
    const y = x.right;
    x.right = y.left;
    if (y.left !== this.NIL) y.left.parent = x;
    y.parent = x.parent;
    if (x.parent === this.NIL) this.root = y;
    else if (x === x.parent.left) x.parent.left = y;
    else x.parent.right = y;
    y.left = x; x.parent = y;
  }
  rotateRight(x) {
    const y = x.left;
    x.left = y.right;
    if (y.right !== this.NIL) y.right.parent = x;
    y.parent = x.parent;
    if (x.parent === this.NIL) this.root = y;
    else if (x === x.parent.right) x.parent.right = y;
    else x.parent.left = y;
    y.right = x; x.parent = y;
  }
  insert(v) {
    const z = { val: v, red: true, left: this.NIL, right: this.NIL, parent: this.NIL }; // 新節點一律為紅色
    let y = this.NIL, x = this.root;
    while (x !== this.NIL) { y = x; x = v < x.val ? x.left : x.right; }
    z.parent = y;
    if (y === this.NIL) this.root = z;
    else if (v < y.val) y.left = z;
    else y.right = z;
    return this.fix(z);
  }
  fix(z) {
    const log = [];
    while (z.parent.red) { // 違反「紅節點的子節點必為黑」
      const g = z.parent.parent, left = z.parent === g.left;
      const u = left ? g.right : g.left;
      if (u.red) { // Case 1：叔叔紅 → 父、叔變黑，祖父變紅，往上繼續
        z.parent.red = u.red = false;
        g.red = true;
        z = g;
        log.push('case 1');
        continue;
      }
      if (z === (left ? z.parent.right : z.parent.left)) { // Case 2：內側 → 轉成外側
        z = z.parent;
        if (left) this.rotateLeft(z); else this.rotateRight(z);
        log.push('case 2');
      }
      z.parent.red = false; g.red = true; // Case 3：外側 → 變色後旋轉祖父
      if (left) this.rotateRight(g); else this.rotateLeft(g);
      log.push('case 3');
    }
    this.root.red = false;
    return log;
  }
  search(v) {
    const path = [];
    for (let c = this.root; c !== this.NIL; c = v < c.val ? c.left : c.right) {
      path.push(c.val);
      if (v === c.val) return [true, path];
    }
    return [false, path];
  }
  // 回傳黑高（含 NIL）；若違反紅黑性質則回傳 -1
  blackHeight(n) {
    if (n === this.NIL) return 1;
    if (n.red && (n.left.red || n.right.red)) return -1;
    const l = this.blackHeight(n.left), r = this.blackHeight(n.right);
    if (l < 0 || l !== r) return -1;
    return l + (n.red ? 0 : 1);
  }
  // 值後面標 R／B 表示紅／黑；括號內為 (左子樹,右子樹)
  fmt(n) {
    if (n === this.NIL) return '-';
    const s = `${n.val}${n.red ? 'R' : 'B'}`;
    if (n.left === this.NIL && n.right === this.NIL) return s;
    return `${s}(${this.fmt(n.left)},${this.fmt(n.right)})`;
  }
}

const t = new RedBlackTree();
for (const v of [41, 38, 31, 12, 19, 8, 45, 50, 55]) {
  const log = t.insert(v);
  console.log(`insert ${v}: ${t.fmt(t.root)}` + (log.length ? `   [${log.join(', ')}]` : ''));
}
for (const v of [19, 40]) {
  const [found, path] = t.search(v);
  console.log(`search ${v}: ${found ? 'found' : 'not found'}, path ${path.join(' -> ')}`);
}
console.log(`black height = ${t.blackHeight(t.root)} (-1 means invalid)`);
