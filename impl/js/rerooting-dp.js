const EDGES = [[1, 2], [1, 3], [2, 4], [2, 5], [3, 6], [3, 7], [5, 8], [5, 9], [7, 10]];
const n = 10;
const adj = Array.from({ length: n + 1 }, () => []);
for (const [a, b] of EDGES) { adj[a].push(b); adj[b].push(a); }
const order = [1], par = { 1: 0 };
for (let i = 0; i < order.length; i++) for (const v of adj[order[i]]) if (!(v in par)) { par[v] = order[i]; order.push(v); }
const sz = {}, down = {}, ans = {};
// 第一次：由下往上算子樹大小與子樹內距離和
for (const u of [...order].reverse()) {
  const kids = adj[u].filter((v) => par[v] === u);
  sz[u] = 1 + kids.reduce((s, v) => s + sz[v], 0);
  down[u] = kids.reduce((s, v) => s + down[v] + sz[v], 0);
}
// 第二次：換根 ans[v] = ans[u] − sz[v] + (n − sz[v])
ans[1] = down[1];
for (const u of order) for (const v of adj[u]) if (par[v] === u) ans[v] = ans[u] - sz[v] + (n - sz[v]);
console.log('sum of distances:', Array.from({ length: n }, (_, i) => `${i + 1}:${ans[i + 1]}`).join(' '));
let best = 1;
for (let v = 1; v <= n; v++) if (ans[v] < ans[best]) best = v;
console.log('best center:', best, 'with', ans[best]);
