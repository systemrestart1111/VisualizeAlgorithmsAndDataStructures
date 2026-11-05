const H = (n) => (n ? n.h : 0), S = (n) => (n ? n.size : 0);
const fix = (n) => { n.h = 1 + Math.max(H(n.left), H(n.right)); n.size = 1 + S(n.left) + S(n.right); };
const rotRight = (n) => { const l = n.left; n.left = l.right; l.right = n; fix(n); fix(l); return l; };
const rotLeft = (n) => { const r = n.right; n.right = r.left; r.left = n; fix(n); fix(r); return r; };

// AVL 平衡；旋轉後重新計算子樹大小
function balance(n) {
  fix(n);
  if (H(n.left) - H(n.right) > 1) { if (H(n.left.left) < H(n.left.right)) n.left = rotLeft(n.left); return rotRight(n); }
  if (H(n.right) - H(n.left) > 1) { if (H(n.right.right) < H(n.right.left)) n.right = rotRight(n.right); return rotLeft(n); }
  return n;
}
function insert(n, k) {
  if (!n) return { key: k, h: 1, size: 1, left: null, right: null };
  if (k < n.key) n.left = insert(n.left, k); else n.right = insert(n.right, k);
  return balance(n);
}
function remove(n, k) {
  if (!n) return null;
  if (k < n.key) n.left = remove(n.left, k);
  else if (k > n.key) n.right = remove(n.right, k);
  else {
    if (!n.left || !n.right) return n.left ?? n.right;
    let m = n.right;
    while (m.left) m = m.left;
    n.key = m.key;
    n.right = remove(n.right, m.key);
  }
  return balance(n);
}
// 第 k 小（1 起算）：比較 k 與左子樹大小
function select(n, k) {
  while (n) {
    const ls = S(n.left);
    if (k === ls + 1) return n.key;
    if (k <= ls) n = n.left; else { k -= ls + 1; n = n.right; }
  }
  return -1;
}
// 比 x 小的個數 + 1
function rank(n, x) {
  let r = 0;
  while (n) { if (x <= n.key) n = n.left; else { r += S(n.left) + 1; n = n.right; } }
  return r + 1;
}
const all = (root) => Array.from({ length: S(root) }, (_, i) => select(root, i + 1)).join(' ');

let root = null;
for (const k of [20, 10, 30, 5, 15, 25, 40, 12, 35, 1]) root = insert(root, k);
console.log('select 1..n:', all(root));
console.log(`rank 13 = ${rank(root, 13)} | rank 26 = ${rank(root, 26)} | rank 0 = ${rank(root, 0)}`);
console.log(`root: ${root.key} size ${root.size} height ${root.h}`);
root = remove(root, 20);
root = remove(root, 5);
console.log('after delete 20, 5:', all(root));
console.log(`select 4 = ${select(root, 4)} | rank 30 = ${rank(root, 30)}`);
