const EDGES = 'AC BC BD CE DF EF EG FH GH'.split(' '); // 有向無環圖
const nodes = [...new Set(EDGES.join(''))].sort();
const adj = Object.fromEntries(nodes.map((v) => [v, []]));
const indeg = Object.fromEntries(nodes.map((v) => [v, 0]));
for (const [a, b] of EDGES) { adj[a].push(b); indeg[b]++; }

// 反覆取出入度為 0 的點，並把它的出邊刪掉（讓鄰居入度減 1）
const q = nodes.filter((v) => indeg[v] === 0);
for (let h = 0; h < q.length; h++) for (const v of adj[q[h]]) if (--indeg[v] === 0) q.push(v);
console.log(q.length === nodes.length ? 'order: ' + q.join(' ') : 'graph has a cycle');
