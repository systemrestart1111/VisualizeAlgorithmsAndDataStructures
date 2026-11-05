const height = (n) => (n ? n.h : 0);
const update = (n) => { n.h = 1 + Math.max(height(n.left), height(n.right)); };
// 平衡因子 = 左子樹高 − 右子樹高，AVL 要求它在 −1..1 之間
const balance = (n) => height(n.left) - height(n.right);

function rotateRight(y) {
  const x = y.left;
  y.left = x.right; x.right = y;
  update(y); update(x);
  return x;
}

function rotateLeft(x) {
  const y = x.right;
  x.right = y.left; y.left = x;
  update(x); update(y);
  return y;
}

function rebalance(n, log) {
  update(n);
  const b = balance(n);
  if (b > 1) {
    if (balance(n.left) < 0) { log.push(`LR at ${n.val}`); n.left = rotateLeft(n.left); }
    else log.push(`LL at ${n.val}`);
    return rotateRight(n);
  }
  if (b < -1) {
    if (balance(n.right) > 0) { log.push(`RL at ${n.val}`); n.right = rotateRight(n.right); }
    else log.push(`RR at ${n.val}`);
    return rotateLeft(n);
  }
  return n;
}

function insert(n, v, log) {
  if (!n) return { val: v, h: 1, left: null, right: null };
  if (v < n.val) n.left = insert(n.left, v, log);
  else if (v > n.val) n.right = insert(n.right, v, log);
  else return n;
  return rebalance(n, log); // 遞迴返回時就是「沿路往上」檢查
}

function remove(n, v, log) {
  if (!n) return null;
  if (v < n.val) n.left = remove(n.left, v, log);
  else if (v > n.val) n.right = remove(n.right, v, log);
  else {
    if (!n.left || !n.right) return n.left || n.right;
    let s = n.right;
    while (s.left) s = s.left;
    n.val = s.val;
    n.right = remove(n.right, s.val, log);
  }
  return rebalance(n, log);
}

// 括號表示法：值(左子樹,右子樹)，空子樹寫成 -
function fmt(n) {
  if (!n) return '-';
  if (!n.left && !n.right) return String(n.val);
  return `${n.val}(${fmt(n.left)},${fmt(n.right)})`;
}

const report = (op, v, root, log) =>
  console.log(`${op} ${String(v).padStart(2)}: ${fmt(root)}` + (log.length ? `   [${log.join(', ')}]` : ''));

let root = null;
for (const v of [40, 20, 60, 10, 30, 50, 70, 25, 27, 5, 4]) { const log = []; root = insert(root, v, log); report('insert', v, root, log); }
for (const v of [50, 70, 60]) { const log = []; root = remove(root, v, log); report('delete', v, root, log); }
console.log('height =', height(root));
