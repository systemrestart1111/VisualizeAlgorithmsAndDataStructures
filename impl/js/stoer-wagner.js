const EDGES = [[1, 2, 2], [1, 5, 3], [2, 3, 3], [2, 5, 2], [2, 6, 2], [3, 4, 4], [3, 7, 2], [4, 7, 2], [4, 8, 2], [5, 6, 3], [6, 7, 1], [7, 8, 3]];
const NODES = [];
for (const [u, v] of EDGES) for (const x of [u, v]) if (!NODES.includes(x)) NODES.push(x);

// 每階段做最大鄰接排序，切出最後加入的點，再把最後兩點合併
function stoerWagner() {
  const n = NODES.length;
  const W = Array.from({ length: n }, () => new Array(n).fill(0));
  for (const [u, v, w] of EDGES) { const a = NODES.indexOf(u), b = NODES.indexOf(v); W[a][b] += w; W[b][a] += w; }
  const members = NODES.map((x) => [x]), alive = new Array(n).fill(true), phases = [];
  let best = Infinity, bestSet = [];
  for (let phase = 0; phase < n - 1; phase++) {
    const ids = alive.map((a, i) => (a ? i : -1)).filter((i) => i >= 0);
    const w = W[ids[0]].slice(), inA = new Set([ids[0]]), order = [ids[0]];
    while (order.length < ids.length) {
      let nxt = -1;
      for (const v of ids) if (!inA.has(v) && (nxt < 0 || w[v] > w[nxt])) nxt = v;
      inA.add(nxt); order.push(nxt);
      for (const v of ids) if (!inA.has(v)) w[v] += W[nxt][v];
    }
    const s = order.at(-2), t = order.at(-1);
    const cut = ids.reduce((x, v) => (v === t ? x : x + W[t][v]), 0);
    phases.push(cut);
    if (cut < best) { best = cut; bestSet = [...members[t]]; }
    for (let v = 0; v < n; v++) { W[s][v] += W[t][v]; W[v][s] = W[s][v]; }
    members[s].push(...members[t]);
    alive[t] = false;
  }
  return [best, bestSet, phases];
}

const [best, side, phases] = stoerWagner();
console.log('cut of each phase:', phases.join(' '));
console.log(`min cut: ${best} side: [${side.sort((a, b) => a - b).join(', ')}]`);
