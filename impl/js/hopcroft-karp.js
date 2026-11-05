const ADJ = [[], [1, 2], [1, 3], [2, 3], [3, 4], [4, 5]]; // 左側 L1..L5 可以配對的右側點
const NL = 5;
const matchL = new Array(NL + 1).fill(0), matchR = new Array(NL + 1).fill(0), dist = new Array(NL + 1).fill(0);

// 從所有未配對的左側點同時 BFS，分層；回傳是否存在增廣路徑
function bfs() {
  const q = [];
  for (let u = 1; u <= NL; u++) {
    dist[u] = matchL[u] === 0 ? 0 : Infinity;
    if (matchL[u] === 0) q.push(u);
  }
  let found = false;
  for (let h = 0; h < q.length; h++) {
    const u = q[h];
    for (const v of ADJ[u]) {
      const w = matchR[v];
      if (w === 0) found = true;
      else if (dist[w] === Infinity) { dist[w] = dist[u] + 1; q.push(w); }
    }
  }
  return found;
}

// 沿分層找一條最短增廣路徑並翻轉
function dfs(u) {
  for (const v of ADJ[u]) {
    const w = matchR[v];
    if (w === 0 || (dist[w] === dist[u] + 1 && dfs(w))) { matchL[u] = v; matchR[v] = u; return true; }
  }
  dist[u] = Infinity;
  return false;
}

// 每一階段找出一組互不相交的最短增廣路徑一起翻轉，總共只需 O(√V) 階段
let size = 0, phases = 0;
while (bfs()) {
  phases++;
  for (let u = 1; u <= NL; u++) if (matchL[u] === 0 && dfs(u)) size++;
}
console.log('phases =', phases, 'matching size =', size);
for (let u = 1; u <= NL; u++) console.log(`L${u} - R${matchL[u]}`);
