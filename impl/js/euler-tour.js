const EDGES = [[1, 2], [1, 3], [2, 4], [2, 5], [3, 6], [5, 7], [6, 8]];
const children = new Map();
for (const [p, c] of EDGES) {
  if (!children.has(p)) children.set(p, []);
  children.get(p).push(c);
}
const tour = [], tin = {}, tout = {};

// 進入節點時記錄一次，每從一個子節點返回再記錄一次；子樹 u 對應 tour[tin[u]..tout[u]]
function dfs(u) {
  tin[u] = tour.length;
  tour.push(u);
  for (const v of children.get(u) ?? []) {
    dfs(v);
    tour.push(u);
  }
  tout[u] = tour.length - 1;
}

dfs(1);
console.log('tour:', tour.join(' '));
for (let u = 1; u <= 8; u++) console.log(`node ${u}: tin = ${tin[u]}, tout = ${tout[u]}`);
