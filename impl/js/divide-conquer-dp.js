const a = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8];
const K = 4, n = a.length;
const S = [0];
for (const x of a) S.push(S.at(-1) + x);
const cost = (i, j) => (S[j] - S[i]) ** 2;
let evals = 0;

// 最佳切點單調：先算 mid，再把左右兩半的搜尋範圍限制在 opt 兩側
function solve(prev, cur, l, r, optL, optR) {
  if (l > r) return;
  const mid = (l + r) >> 1;
  let best = Infinity, bi = optL;
  for (let i = optL; i <= Math.min(mid - 1, optR); i++) { evals++; const v = prev[i] + cost(i, mid); if (v < best) { best = v; bi = i; } }
  cur[mid] = best;
  solve(prev, cur, l, mid - 1, optL, bi);
  solve(prev, cur, mid + 1, r, bi, optR);
}

let dp = Array.from({ length: n + 1 }, (_, j) => cost(0, j));
for (let g = 2; g <= K; g++) { const cur = new Array(n + 1).fill(Infinity); solve(dp, cur, 1, n, 0, n - 1); dp = cur; }
let nd = Array.from({ length: n + 1 }, (_, j) => cost(0, j)), naive = 0;
for (let g = 2; g <= K; g++) {
  const cur = new Array(n + 1).fill(Infinity);
  for (let j = 1; j <= n; j++) for (let i = 0; i < j; i++) { naive++; cur[j] = Math.min(cur[j], nd[i] + cost(i, j)); }
  nd = cur;
}
console.log('min sum of squares:', dp[n], '| naive:', nd[n]);
console.log('transitions evaluated:', evals, 'vs', naive);
