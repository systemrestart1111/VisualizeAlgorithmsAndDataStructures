const PTS = [[3, 1], [7, 2], [10, 5], [6, 4], [2, 6], [5, 7], [8, 9], [1, 3], [4, 4], [9, 7], [6, 10], [3, 9], [7, 6]];
const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

// 以最低點為基準依極角排序，依序加入；若形成右轉（非逆時針）就把堆疊頂端彈出
function grahamScan(pts) {
  const p0 = pts.reduce((m, p) => (p[1] < m[1] || (p[1] === m[1] && p[0] < m[0]) ? p : m));
  const rest = pts.filter((p) => p !== p0).sort((a, b) => {
    const c = cross(p0, a, b);
    return c ? (c > 0 ? -1 : 1) : d2(p0, a) - d2(p0, b); // 共線時近的在前
  });
  const stack = [p0];
  for (const p of rest) {
    while (stack.length >= 2 && cross(stack[stack.length - 2], stack[stack.length - 1], p) <= 0) stack.pop();
    stack.push(p);
  }
  return stack;
}

console.log('hull (counter-clockwise):', grahamScan(PTS).map(([x, y]) => `(${x},${y})`).join(' '));
