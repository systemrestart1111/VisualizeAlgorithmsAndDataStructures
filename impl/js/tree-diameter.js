const EDGES = [[1, 2], [1, 3], [2, 4], [2, 5], [3, 6], [3, 7], [5, 8], [5, 9], [6, 10], [9, 11], [7, 12]];
const adj = new Map();
for (const [a, b] of EDGES) {
  if (!adj.has(a)) adj.set(a, []);
  if (!adj.has(b)) adj.set(b, []);
  adj.get(a).push(b);
  adj.get(b).push(a);
}

// 回傳距離最遠的點與 parent 表（距離相同時取最先被發現的點）
function bfs(src) {
  const dist = new Map([[src, 0]]), parent = new Map([[src, null]]);
  const q = [src];
  let far = src;
  for (let h = 0; h < q.length; h++) {
    const u = q[h];
    if (dist.get(u) > dist.get(far)) far = u;
    for (const v of adj.get(u))
      if (!dist.has(v)) { dist.set(v, dist.get(u) + 1); parent.set(v, u); q.push(v); }
  }
  return [far, dist.get(far), parent];
}

const [u] = bfs(1);            // 第一次 BFS：任意點出發的最遠點 u 一定是直徑的端點
let [v, d, parent] = bfs(u);   // 第二次 BFS：從 u 出發的最遠點 v
const path = [];
for (; v !== null; v = parent.get(v)) path.push(v);
console.log('diameter =', d);
console.log('path:', path.join(' '));
