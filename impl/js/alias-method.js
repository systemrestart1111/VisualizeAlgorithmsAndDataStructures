// Vose 別名法：縮放成平均 1，矮欄用高欄補滿，每欄最多兩個選項
function build(W) {
  if (W.some((w) => w < 0)) throw new Error('weights must be non-negative');
  const total = W.reduce((a, b) => a + b, 0);
  if (total <= 0) throw new Error('total weight must be positive');
  const n = W.length, p = W.map((w) => (w / total) * n);
  const prob = new Array(n).fill(0), alias = new Array(n).fill(-1);
  const small = [], large = [];
  p.forEach((v, i) => (v < 1 ? small : large).push(i));
  while (small.length && large.length) {
    const s = small.pop(), l = large.pop();
    prob[s] = p[s]; alias[s] = l;
    p[l] -= 1 - p[s];
    (p[l] < 1 ? small : large).push(l);
  }
  for (const i of [...small, ...large]) { prob[i] = 1; alias[i] = i; }
  return { prob, alias };
}

for (const W of [[5, 1, 3, 1, 8, 2], [0, 3, 0, 1], [1, 1, 1, 1], [7]]) {
  const { prob, alias } = build(W);
  let st = 7;
  const nxt = () => (st = (st * 48271) % 2147483647);
  const N = 10000, cnt = new Array(W.length).fill(0);
  // 隨機選一欄，再擲硬幣決定取本身或別名：O(1)
  for (let k = 0; k < N; k++) { const i = nxt() % W.length; cnt[nxt() / 2147483647 < prob[i] ? i : alias[i]]++; }
  const total = W.reduce((a, b) => a + b, 0);
  let chi = 0;
  W.forEach((w, i) => { if (w > 0) { const e = (w / total) * N; chi += (cnt[i] - e) ** 2 / e; } });
  console.log(`weights [${W.join(', ')}]: prob ${prob.map((p) => p.toFixed(4)).join(' ')}, alias ${alias.join(' ')}, counts ${cnt.join(' ')}, chi-square ${chi.toFixed(3)}`);
}
for (const W of [[1, -1], [0, 0]]) {
  try { build(W); } catch (e) { console.log(`weights [${W.join(', ')}]: ${e.message}`); }
}
