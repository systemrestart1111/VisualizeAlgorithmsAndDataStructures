const EDGES = ['AB', 'AC', 'AD', 'BC', 'BD', 'CD', 'DE', 'EF', 'EG', 'FG', 'FH', 'GH', 'EH'];
const NODES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
let seed = 42;
const rnd = (n) => { seed = (seed * 48271) % 2147483647; return seed % n; };

// 隨機縮邊直到剩兩個超節點；兩者之間的邊數就是一個割
function trial() {
  const p = Object.fromEntries(NODES.map((v) => [v, v]));
  const find = (x) => { while (p[x] !== x) x = p[x]; return x; };
  for (let groups = NODES.length; groups > 2; groups--) {
    const live = EDGES.map((_, i) => i).filter((i) => find(EDGES[i][0]) !== find(EDGES[i][1]));
    const i = live[rnd(live.length)];
    p[find(EDGES[i][0])] = find(EDGES[i][1]);
  }
  return EDGES.filter(([u, v]) => find(u) !== find(v)).length;
}

const cuts = Array.from({ length: 6 }, trial);
let brute = EDGES.length;
for (let m = 1; m < 1 << (NODES.length - 1); m++) {
  const side = (v) => (m >> NODES.indexOf(v)) & 1;
  brute = Math.min(brute, EDGES.filter(([u, v]) => side(u) !== side(v)).length);
}
console.log('cuts per trial:', cuts.join(' '));
console.log('best:', Math.min(...cuts), '| brute force:', brute);
