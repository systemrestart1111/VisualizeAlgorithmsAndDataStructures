const ITEMS = [[12, 4], [2, 2], [1, 1], [4, 10], [1, 2], [6, 7], [3, 5], [5, 8], [9, 9], [7, 6], [8, 11], [2, 3]];
const CAP = 25;
const weight = (c) => c.reduce((s, b, i) => s + b * ITEMS[i][0], 0);
const value = (c) => c.reduce((s, b, i) => s + b * ITEMS[i][1], 0);
const BY_RATIO = ITEMS.map((_, i) => i).sort((a, b) => ITEMS[a][1] / ITEMS[a][0] - ITEMS[b][1] / ITEMS[b][0] || a - b);
// 超重時依價值重量比由差到好拿掉物品，保持可行
const repair = (c) => { for (const i of BY_RATIO) { if (weight(c) <= CAP) break; c[i] = 0; } return c; };
const bestOf = (pop) => pop.reduce((a, c) => (value(c) > value(a) ? c : a));

// 錦標賽選擇（3 取 1）、單點交配、位元突變、菁英保留
function genetic(seed, gens, pm, size = 16) {
  let s = seed;
  const nxt = () => (s = (s * 48271) % 2147483647);
  const n = ITEMS.length;
  let pop = Array.from({ length: size }, () => repair(Array.from({ length: n }, () => nxt() % 2)));
  const tour = () => { let b = pop[nxt() % size]; for (let k = 0; k < 2; k++) { const c = pop[nxt() % size]; if (value(c) > value(b)) b = c; } return b; };
  for (let g = 0; g < gens; g++) {
    const next = [[...bestOf(pop)]];
    while (next.length < size) {
      const a = tour(), b = tour();
      const cut = 1 + (nxt() % (n - 1));
      next.push(repair([...a.slice(0, cut), ...b.slice(cut)].map((bit) => (nxt() / 2147483647 < pm ? 1 - bit : bit))));
    }
    pop = next;
  }
  return bestOf(pop);
}

const dp = new Array(CAP + 1).fill(0);
for (const [w, v] of ITEMS) for (let c = CAP; c >= w; c--) dp[c] = Math.max(dp[c], dp[c - w] + v);
console.log(`dynamic programming optimum: ${dp[CAP]}`);
for (const [seed, gens, pm] of [[4, 30, 0.05], [4, 80, 0.05], [9, 30, 0.01], [2, 30, 0.2]]) {
  const best = genetic(seed, gens, pm);
  console.log(`seed ${seed}, ${gens} generations, mutation ${pm}: best ${best.join('')}, weight ${weight(best)}, value ${value(best)}`);
}
