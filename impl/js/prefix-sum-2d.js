// P[i][j] = 左上角 (0,0) 到 (i-1, j-1) 的總和
function build(a) {
  const R = a.length, C = a[0].length;
  const P = Array.from({ length: R + 1 }, () => new Array(C + 1).fill(0));
  for (let i = 1; i <= R; i++) for (let j = 1; j <= C; j++) P[i][j] = a[i - 1][j - 1] + P[i - 1][j] + P[i][j - 1] - P[i - 1][j - 1];
  return P;
}
const query = (P, r1, c1, r2, c2) => P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1];

const a = [[3, 0, 1, 4, 2], [5, 6, 3, 2, 1], [1, 2, 0, 1, 5], [4, 1, 0, 1, 7], [1, 0, 3, 0, 5]];
const P = build(a);
for (const q of [[1, 1, 3, 3], [0, 0, 4, 4], [2, 2, 2, 2], [0, 3, 4, 4]]) {
  let brute = 0;
  for (let i = q[0]; i <= q[2]; i++) for (let j = q[1]; j <= q[3]; j++) brute += a[i][j];
  console.log(`sum(${q.join(', ')}) = ${query(P, ...q)} (brute ${brute})`);
}
