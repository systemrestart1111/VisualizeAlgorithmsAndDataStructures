const EDGES = [[1, 2], [1, 3], [1, 4], [2, 5], [2, 6], [3, 7], [5, 8], [5, 9], [5, 10], [7, 11], [9, 12], [4, 13], [13, 14]];
const N = 15;
const children = Array.from({ length: N }, () => []);
for (const [p, c] of EDGES) children[p].push(c);
const parent = new Array(N).fill(0), depth = new Array(N).fill(0), size = new Array(N).fill(1), heavy = new Array(N).fill(0);
const head = new Array(N).fill(0), pos = new Array(N).fill(0), order = [];

// 計算子樹大小；子樹最大的孩子是重兒子（相同時取先出現的）
function dfsSize(u) {
  for (const v of children[u]) {
    parent[v] = u;
    depth[v] = depth[u] + 1;
    dfsSize(v);
    size[u] += size[v];
    if (heavy[u] === 0 || size[v] > size[heavy[u]]) heavy[u] = v;
  }
}

// 沿重兒子延伸同一條重鏈（head 相同、pos 連續），輕兒子各自開新鏈
function decompose(u, h) {
  head[u] = h;
  pos[u] = order.length;
  order.push(u);
  if (heavy[u]) decompose(heavy[u], h);
  for (const v of children[u]) if (v !== heavy[u]) decompose(v, v);
}

// 路徑 a–b 拆成 O(log n) 段，每段都是重鏈上 pos 連續的一段
function pathSegments(a, b) {
  const segs = [];
  while (head[a] !== head[b]) {
    if (depth[head[a]] < depth[head[b]]) [a, b] = [b, a];
    segs.push(order.slice(pos[head[a]], pos[a] + 1));
    a = parent[head[a]];
  }
  segs.push(order.slice(Math.min(pos[a], pos[b]), Math.max(pos[a], pos[b]) + 1));
  return segs;
}

dfsSize(1);
decompose(1, 1);
console.log('chains:');
for (const u of order) {
  if (head[u] !== u) continue;
  const chain = [];
  for (let v = u; v; v = heavy[v]) chain.push(v);
  console.log(' ', chain.join(' '));
}
console.log('path(12, 14) segments:');
for (const s of pathSegments(12, 14)) console.log(' ', s.join(' '));
