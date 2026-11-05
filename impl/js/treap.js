// 與網頁相同的 Park–Miller 亂數，固定種子讓結果可重現
let seed = 2024;
const rnd = (n) => { seed = (seed * 48271) % 2147483647; return seed % n; };

const rotRight = (n) => { const l = n.left; n.left = l.right; l.right = n; return l; };
const rotLeft = (n) => { const r = n.right; n.right = r.left; r.left = n; return r; };

// 依 BST 插到葉子，回溯時若子節點優先權較高就旋轉上來（最大堆積）
function insert(n, key) {
  if (!n) return { key, pri: rnd(100), left: null, right: null };
  if (key === n.key) return n;
  if (key < n.key) { n.left = insert(n.left, key); if (n.left.pri > n.pri) n = rotRight(n); }
  else { n.right = insert(n.right, key); if (n.right.pri > n.pri) n = rotLeft(n); }
  return n;
}
// 把節點往優先權較高的子節點方向轉下去，直到最多一個子節點再移除
function remove(n, key) {
  if (!n) return null;
  if (key < n.key) n.left = remove(n.left, key);
  else if (key > n.key) n.right = remove(n.right, key);
  else {
    if (!n.left || !n.right) return n.left ?? n.right;
    if (n.left.pri > n.right.pri) { n = rotRight(n); n.right = remove(n.right, key); }
    else { n = rotLeft(n); n.left = remove(n.left, key); }
  }
  return n;
}
const pre = (n) => (n ? [`${n.key}(p${n.pri})`, ...pre(n.left), ...pre(n.right)] : []);
const ino = (n) => (n ? [...ino(n.left), n.key, ...ino(n.right)] : []);

let root = null;
for (const k of [30, 15, 45, 8, 22, 37, 52]) root = insert(root, k);
console.log('preorder:', pre(root).join(' '));
console.log('inorder :', ino(root).join(' '));
root = remove(root, 30);
root = remove(root, 8);
console.log('after delete 30, 8:', pre(root).join(' '));
console.log('inorder :', ino(root).join(' '));
