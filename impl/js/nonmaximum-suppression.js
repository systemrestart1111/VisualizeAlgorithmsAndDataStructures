const N = 16;
const BUMPS = [[3, 3, 100], [3, 6, 100], [10, 4, 80], [8, 12, 120], [13, 13, 60]];
const S = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => { let s = 0; for (const [br, bc, A] of BUMPS) s += A * Math.exp(-((r - br) ** 2 + (c - bc) ** 2) / 3); return Math.floor(s + 0.5); }));
for (const [r, c] of [[12, 7], [12, 8], [13, 7], [13, 8]]) S[r][c] = 70;

// 不小於視窗內所有鄰居才保留；相等時只留光柵順序最早的
function nms(rad, thr) {
  const kept = [];
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      if (S[i][j] < thr) continue;
      let ok = true;
      for (let a = -rad; a <= rad; a++)
        for (let b = -rad; b <= rad; b++) {
          const y = i + a, x = j + b;
          if ((a || b) && y >= 0 && y < N && x >= 0 && x < N && (S[y][x] > S[i][j] || (S[y][x] === S[i][j] && (a < 0 || (a === 0 && b < 0))))) ok = false;
        }
      if (ok) kept.push([i, j]);
    }
  return kept;
}

for (const [rad, thr] of [[1, 30], [2, 30], [1, 80]]) {
  const kept = nms(rad, thr);
  console.log(`window ${2 * rad + 1}x${2 * rad + 1}, threshold ${thr}: ${kept.length} kept: ${kept.map(([i, j]) => `(${i},${j})=${S[i][j]}`).join(' ')}`);
}
