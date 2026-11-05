const EDGES = [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [4, 8], [8, 9], [9, 10], [2, 11], [6, 12]];
const adj = new Map();
for (const [a, b] of EDGES) { for (const x of [a, b]) if (!adj.has(x)) adj.set(x, []); adj.get(a).push(b); adj.get(b).push(a); }
for (const l of adj.values()) l.sort((a, b) => (String(a) < String(b) ? -1 : 1)); // 與網頁相同：鄰居依字串排序
const removed = new Set(), cpar = {}, level = {};

function component(s) {
  const order = [s], seen = new Set([s]);
  for (let i = 0; i < order.length; i++) for (const v of adj.get(order[i])) if (!removed.has(v) && !seen.has(v)) { seen.add(v); order.push(v); }
  return order;
}
// 找出塊的重心（刪除後最大塊 ≤ 一半），移除後對每一塊遞迴
function decompose(start, par, lv) {
  const order = component(start);
  const pr = new Map([[start, null]]), sz = {};
  for (const u of order) for (const v of adj.get(u)) if (!removed.has(v) && !pr.has(v)) pr.set(v, u);
  for (const u of [...order].reverse()) sz[u] = 1 + adj.get(u).filter((v) => !removed.has(v) && pr.get(v) === u).reduce((s, v) => s + sz[v], 0);
  const n = order.length;
  let c = start;
  for (const u of order) {
    const big = Math.max(n - sz[u], ...adj.get(u).filter((v) => !removed.has(v) && pr.get(v) === u).map((v) => sz[v]));
    if (big <= n / 2) { c = u; break; }
  }
  removed.add(c); cpar[c] = par; level[c] = lv;
  for (const v of adj.get(c)) if (!removed.has(v)) decompose(v, c, lv + 1);
}

decompose(1, null, 0);
for (const v of [...adj.keys()].sort((a, b) => a - b)) console.log(`node ${String(v).padStart(2)}: level ${level[v]}, centroid parent ${cpar[v] ?? '-'}`);
console.log('depth:', Math.max(...Object.values(level)) + 1);
