const NAMES = 'ABCDE';

// 無向加權圖，同時維護兩種表示法：鄰接矩陣 O(V²) 空間、鄰接串列 O(V + E) 空間
class Graph {
  constructor(n) {
    this.matrix = Array.from({ length: n }, () => new Array(n).fill(0));
    this.adj = Array.from({ length: n }, () => []); // 每項為 [鄰居, 權重]
  }
  addEdge(u, v, w) {
    this.matrix[u][v] = this.matrix[v][u] = w;
    this.adj[u].push([v, w]);
    this.adj[v].push([u, w]);
  }
  removeEdge(u, v) {
    this.matrix[u][v] = this.matrix[v][u] = 0;
    this.adj[u] = this.adj[u].filter(([x]) => x !== v);
    this.adj[v] = this.adj[v].filter(([x]) => x !== u);
  }
  bfs(s) {
    const seen = new Set([s]), order = [], q = [s];
    for (let h = 0; h < q.length; h++) {
      const u = q[h];
      order.push(u);
      for (const [v] of this.adj[u]) if (!seen.has(v)) { seen.add(v); q.push(v); }
    }
    return order;
  }
  dfs(u, seen = new Set()) {
    seen.add(u);
    const order = [u];
    for (const [v] of this.adj[u]) if (!seen.has(v)) order.push(...this.dfs(v, seen));
    return order;
  }
  show() {
    console.log('matrix:   ' + [...NAMES].map((c) => c.padStart(2)).join(' '));
    this.matrix.forEach((row, i) => console.log(`        ${NAMES[i]} ` + row.map((w) => String(w).padStart(2)).join(' ')));
    console.log('list:');
    this.adj.forEach((lst, i) => console.log(`  ${NAMES[i]} -> ` + (lst.map(([v, w]) => `${NAMES[v]}(${w})`).join(' ') || '-')));
  }
}

const idx = (c) => NAMES.indexOf(c);

const g = new Graph(5);
for (const [u, v, w] of [['A', 'B', 4], ['A', 'C', 2], ['B', 'D', 5], ['C', 'D', 8], ['D', 'E', 3]]) g.addEdge(idx(u), idx(v), w);
g.show();
g.addEdge(idx('A'), idx('E'), 6); console.log('add edge A-E (6)');
g.removeEdge(idx('C'), idx('D')); console.log('remove edge C-D');
g.show();
console.log('BFS from A: ' + g.bfs(0).map((i) => NAMES[i]).join(' '));
console.log('DFS from A: ' + g.dfs(0).map((i) => NAMES[i]).join(' '));
