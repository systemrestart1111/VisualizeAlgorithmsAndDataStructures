const PTS = [[3, 1], [7, 2], [10, 5], [6, 4], [2, 6], [5, 7], [8, 9], [1, 3], [4, 4], [9, 7], [6, 10], [3, 9], [7, 6]];
const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

// 禮物包裝法：從最左點出發，每次找「所有點都在它左側」的下一個點，O(nh)
function jarvisMarch(pts) {
  const start = pts.reduce((m, p) => (p[0] < m[0] || (p[0] === m[0] && p[1] < m[1]) ? p : m));
  const hull = [];
  let p = start;
  do {
    hull.push(p);
    let q = pts[0] === p ? pts[1] : pts[0];
    for (const r of pts) {
      const c = cross(p, q, r);
      if (c < 0 || (c === 0 && d2(p, r) > d2(p, q))) q = r; // r 在 p→q 右側，或共線但更遠
    }
    p = q;
  } while (p !== start);
  return hull;
}

console.log('hull (counter-clockwise):', jarvisMarch(PTS).map(([x, y]) => `(${x},${y})`).join(' '));
