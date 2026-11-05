const NAMES = 'SACBDT', n = NAMES.length;
const EDGES = [['S', 'A', 10], ['S', 'C', 10], ['A', 'B', 4], ['A', 'C', 2], ['A', 'D', 8], ['C', 'D', 9], ['D', 'B', 6], ['B', 'T', 10], ['D', 'T', 10]];
const cap = Array.from({ length: n }, () => new Array(n).fill(0));
for (const [a, b, c] of EDGES) cap[NAMES.indexOf(a)][NAMES.indexOf(b)] += c;
const S = NAMES.indexOf('S'), T = NAMES.indexOf('T');
let level, it;

// 建立層次圖：level[v] = S 到 v 的最少邊數
function bfsLevel() {
  level = new Array(n).fill(-1);
  level[S] = 0;
  const q = [S];
  for (let h = 0; h < q.length; h++)
    for (let v = 0; v < n; v++) if (level[v] < 0 && cap[q[h]][v] > 0) { level[v] = level[q[h]] + 1; q.push(v); }
  return level[T] >= 0;
}

// 只沿 level 加一的邊前進（阻塞流）；it[u] 記錄 u 下一條要試的邊，走不通的邊不再重試
function dfs(u, pushed) {
  if (u === T) return pushed;
  for (; it[u] < n; it[u]++) {
    const v = it[u];
    if (cap[u][v] > 0 && level[v] === level[u] + 1) {
      const d = dfs(v, Math.min(pushed, cap[u][v]));
      if (d) { cap[u][v] -= d; cap[v][u] += d; return d; }
    }
  }
  return 0;
}

let flow = 0, phase = 0;
while (bfsLevel()) {
  it = new Array(n).fill(0);
  let got = 0, d;
  while ((d = dfs(S, Infinity))) got += d;
  flow += got;
  const lv = [...NAMES].map((c, v) => (level[v] >= 0 ? `${c}=${level[v]}` : null)).filter(Boolean).join(' ');
  console.log(`phase ${++phase}: levels ${lv} blocking flow +${got}`);
}
console.log('max flow =', flow);
const reach = new Set([S]), stack = [S];
while (stack.length) {
  const u = stack.pop();
  for (let v = 0; v < n; v++) if (cap[u][v] > 0 && !reach.has(v)) { reach.add(v); stack.push(v); }
}
console.log('min cut S-side:', [...reach].sort((a, b) => a - b).map((v) => NAMES[v]).join(' '));
