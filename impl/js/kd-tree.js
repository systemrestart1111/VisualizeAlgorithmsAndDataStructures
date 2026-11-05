// 交替以 x、y 的中位數切分
function build(pts, depth = 0) {
  if (!pts.length) return null;
  const axis = depth % 2;
  const s = [...pts].sort((a, b) => a[axis] - b[axis] || a[1 - axis] - b[1 - axis]);
  const m = s.length >> 1;
  return { p: s[m], axis, left: build(s.slice(0, m), depth + 1), right: build(s.slice(m + 1), depth + 1) };
}
// 先走查詢點所在的一側；到切分線的距離小於目前最近距離才檢查另一側
function nearest(root, q) {
  let best = null, bd = Infinity, visited = 0;
  const go = (n) => {
    if (!n) return;
    visited++;
    const d = (n.p[0] - q[0]) ** 2 + (n.p[1] - q[1]) ** 2;
    if (d < bd) { bd = d; best = n.p; }
    const diff = q[n.axis] - n.p[n.axis];
    const [near, far] = diff < 0 ? [n.left, n.right] : [n.right, n.left];
    go(near);
    if (diff * diff < bd) go(far);
  };
  go(root);
  return [best, bd, visited];
}

const pts = [[30, 40], [5, 25], [70, 70], [10, 12], [50, 30], [35, 45], [80, 15], [60, 85], [20, 75], [90, 55], [45, 60]];
const root = build(pts);
const s = (p) => `(${p[0]}, ${p[1]})`;
console.log(`root: ${s(root.p)} | left: ${s(root.left.p)} | right: ${s(root.right.p)}`);
for (const q of [[52, 52], [12, 20], [95, 95], [0, 100]]) {
  const [b, d2, v] = nearest(root, q);
  const brute = Math.min(...pts.map((p) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2));
  console.log(`nearest to ${s(q)}: ${s(b)} dist ${Math.sqrt(d2).toFixed(2)} visited ${v}/${pts.length} brute ${Math.sqrt(brute).toFixed(2)}`);
}
