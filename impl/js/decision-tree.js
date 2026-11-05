function data(kind, seed = 3) {
  let s = seed;
  const nxt = () => (s = (s * 48271) % 2147483647);
  return Array.from({ length: 30 }, () => {
    const x = (nxt() % 1000) / 100, y = (nxt() % 1000) / 100;
    const c = kind === 'xor' ? ((x < 5) !== (y < 5) ? 1 : 0) : kind === 'diag' ? (x + y > 10 ? 1 : 0) : x > 6 ? 2 : y > 5 ? 1 : 0;
    return { p: [x, y], c };
  });
}

function makeTree(D) {
  const K = Math.max(...D.map((d) => d.c)) + 1;
  const gini = (idx) => { if (!idx.length) return 0; const cnt = new Array(K).fill(0); for (const i of idx) cnt[D[i].c]++; return 1 - cnt.reduce((s, v) => s + (v / idx.length) ** 2, 0); };
  const majority = (idx) => { const cnt = new Array(K).fill(0); for (const i of idx) cnt[D[i].c]++; return cnt.indexOf(Math.max(...cnt)); };
  // Gini 最低的切分；停止：純淨、達深度上限或樣本 < 2；平手取特徵小、門檻小
  return function build(idx, depth, maxDepth, out, pad = '  ') {
    const g = gini(idx);
    if (g < 1e-12 || depth >= maxDepth || idx.length < 2) { out.push(`${pad}leaf class ${majority(idx)} (n=${idx.length})`); return; }
    let best = null;
    for (let f = 0; f < 2; f++) {
      const vals = [...new Set(idx.map((i) => D[i].p[f]))].sort((a, b) => a - b);
      for (let k = 0; k + 1 < vals.length; k++) {
        const t = (vals[k] + vals[k + 1]) / 2;
        const L = idx.filter((i) => D[i].p[f] <= t), R = idx.filter((i) => D[i].p[f] > t);
        const s = (L.length / idx.length) * gini(L) + (R.length / idx.length) * gini(R);
        if (!best || s < best.s - 1e-12) best = { s, f, t, L, R };
      }
    }
    if (!best) { out.push(`${pad}leaf class ${majority(idx)} (n=${idx.length})`); return; }
    out.push(`${pad}x${best.f + 1} <= ${best.t.toFixed(3)} (n=${idx.length}, gini ${g.toFixed(3)} -> ${best.s.toFixed(3)})`);
    build(best.L, depth + 1, maxDepth, out, pad + '  ');
    build(best.R, depth + 1, maxDepth, out, pad + '  ');
  };
}

for (const [kind, depth] of [['blocks', 2], ['xor', 2], ['xor', 3], ['diag', 3]]) {
  const D = data(kind), out = [];
  makeTree(D)(D.map((_, i) => i), 0, depth, out);
  console.log(`${kind}, max depth ${depth}:`);
  for (const line of out) console.log(line);
}
