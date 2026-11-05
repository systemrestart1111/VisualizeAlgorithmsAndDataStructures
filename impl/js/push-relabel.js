const NAMES = 'SACBDT', n = NAMES.length;
const EDGES = [['S', 'A', 10], ['S', 'C', 10], ['A', 'B', 4], ['A', 'C', 2], ['A', 'D', 8], ['C', 'D', 9], ['D', 'B', 6], ['B', 'T', 10], ['D', 'T', 10]];
const cap = Array.from({ length: n }, () => new Array(n).fill(0));
for (const [a, b, c] of EDGES) cap[NAMES.indexOf(a)][NAMES.indexOf(b)] += c;
const S = NAMES.indexOf('S'), T = NAMES.indexOf('T');

// 前置流：先把 S 的出邊全部灌滿；之後不斷把「溢出」的點的多餘流量往較低的鄰居推，推不動就把自己抬高
const height = new Array(n).fill(0), excess = new Array(n).fill(0), active = [];
let pushes = 0, relabels = 0;
height[S] = n;
for (let v = 0; v < n; v++)
  if (cap[S][v] > 0) {
    excess[v] += cap[S][v];
    cap[v][S] += cap[S][v];
    cap[S][v] = 0;
    if (v !== T) active.push(v);
  }
for (let h = 0; h < active.length; h++) { // FIFO：依序處理溢出的點
  const u = active[h];
  while (excess[u] > 0) {
    for (let v = 0; v < n && excess[u] > 0; v++)
      if (cap[u][v] > 0 && height[u] === height[v] + 1) { // 只能往低一層推
        const d = Math.min(excess[u], cap[u][v]);
        cap[u][v] -= d; cap[v][u] += d;
        excess[u] -= d; excess[v] += d;
        pushes++;
        if (v !== S && v !== T && excess[v] === d) active.push(v);
      }
    if (excess[u] > 0) { // 推不出去：抬高到比最低的可達鄰居高一層
      let mn = Infinity;
      for (let v = 0; v < n; v++) if (cap[u][v] > 0) mn = Math.min(mn, height[v]);
      height[u] = mn + 1;
      relabels++;
    }
  }
}
console.log('max flow =', excess[T]);
console.log('pushes =', pushes, 'relabels =', relabels);
const reach = new Set([S]), stack = [S];
while (stack.length) {
  const u = stack.pop();
  for (let v = 0; v < n; v++) if (cap[u][v] > 0 && !reach.has(v)) { reach.add(v); stack.push(v); }
}
console.log('min cut S-side:', [...reach].sort((a, b) => a - b).map((v) => NAMES[v]).join(' '));
