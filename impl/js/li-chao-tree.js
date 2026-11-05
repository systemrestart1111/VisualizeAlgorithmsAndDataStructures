const X = 15;
const tree = new Map();
const f = (l, x) => l[0] * x + l[1];

// 每個節點保存在中點較小的直線；另一條只可能在某一半較小，遞迴進入那一半
function insert(line, o = 1, l = 0, r = X) {
  if (!tree.has(o)) { tree.set(o, line); return; }
  const m = (l + r) >> 1;
  const cur = tree.get(o);
  if (f(line, m) < f(cur, m)) { tree.set(o, line); line = cur; }
  if (l === r) return;
  if (f(line, l) < f(tree.get(o), l)) insert(line, 2 * o, l, m);
  else if (f(line, r) < f(tree.get(o), r)) insert(line, 2 * o + 1, m + 1, r);
}
function query(x) {
  let o = 1, l = 0, r = X, best = Infinity;
  while (tree.has(o)) {
    best = Math.min(best, f(tree.get(o), x));
    if (l === r) break;
    const m = (l + r) >> 1;
    if (x <= m) { o = 2 * o; r = m; } else { o = 2 * o + 1; l = m + 1; }
  }
  return best;
}

const lines = [[1, 2], [-1, 10], [0, 6], [2, -6], [-2, 20], [1, 3]];
for (const ln of lines) insert(ln);
for (let x = 0; x <= X; x += 3) console.log(`x = ${String(x).padStart(2)}: li chao ${query(x)}, brute ${Math.min(...lines.map((ln) => f(ln, x)))}`);
