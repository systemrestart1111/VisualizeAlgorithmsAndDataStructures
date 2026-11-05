const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
// 已知 p、q、r 共線：r 是否落在 pq 的範圍內
const onSegment = (p, q, r) => Math.min(p[0], q[0]) <= r[0] && r[0] <= Math.max(p[0], q[0]) && Math.min(p[1], q[1]) <= r[1] && r[1] <= Math.max(p[1], q[1]);

// 兩條線段互相「跨立」（各自的兩端點分別在另一條線的兩側），或端點恰好落在另一條線段上
function intersect(p1, p2, p3, p4) {
  const d1 = cross(p3, p4, p1), d2 = cross(p3, p4, p2), d3 = cross(p1, p2, p3), d4 = cross(p1, p2, p4);
  if ((d1 > 0) !== (d2 > 0) && d1 && d2 && (d3 > 0) !== (d4 > 0) && d3 && d4) return true;
  return (d1 === 0 && onSegment(p3, p4, p1)) || (d2 === 0 && onSegment(p3, p4, p2)) ||
         (d3 === 0 && onSegment(p1, p2, p3)) || (d4 === 0 && onSegment(p1, p2, p4));
}

const SEGS = [[1, 1, 9, 7, 2, 8, 8, 2], [1, 1, 4, 4, 5, 5, 9, 2], [2, 2, 8, 2, 5, 2, 5, 7], [1, 6, 4, 9, 6, 1, 9, 4]];
for (const s of SEGS) {
  const p = [0, 2, 4, 6].map((i) => [s[i], s[i + 1]]);
  console.log(`(${s[0]},${s[1]})-(${s[2]},${s[3]}) vs (${s[4]},${s[5]})-(${s[6]},${s[7]}):`, intersect(...p) ? 'intersect' : 'no');
}
