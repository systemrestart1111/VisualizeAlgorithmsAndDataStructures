const R = 5, C = 6;
const ops = [[0, 0, 2, 2, 3], [1, 2, 4, 5, 2], [3, 0, 4, 1, -1]];
const D = Array.from({ length: R + 1 }, () => new Array(C + 1).fill(0));
const naive = Array.from({ length: R }, () => new Array(C).fill(0));
for (const [r1, c1, r2, c2, v] of ops) {
  // 只改四個角
  D[r1][c1] += v; D[r1][c2 + 1] -= v; D[r2 + 1][c1] -= v; D[r2 + 1][c2 + 1] += v;
  for (let i = r1; i <= r2; i++) for (let j = c1; j <= c2; j++) naive[i][j] += v;
}
// 二維前綴和還原
const out = Array.from({ length: R }, () => new Array(C).fill(0));
for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) out[i][j] = D[i][j] + (i ? out[i - 1][j] : 0) + (j ? out[i][j - 1] : 0) - (i && j ? out[i - 1][j - 1] : 0);
for (const row of out) console.log(row.map((x) => String(x).padStart(2)).join(' '));
console.log('matches naive:', JSON.stringify(out) === JSON.stringify(naive) ? 'True' : 'False');
