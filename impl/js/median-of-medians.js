// BFPRT：每 5 個一組取中位數，再遞迴取「中位數的中位數」當 pivot，保證最壞 O(n)
function select(a, k) {
  if (a.length <= 5) return [...a].sort((x, y) => x - y)[k];
  const med = [];
  for (let i = 0; i < a.length; i += 5) {
    const g = a.slice(i, i + 5).sort((x, y) => x - y);
    med.push(g[g.length >> 1]);
  }
  const pivot = select(med, med.length >> 1);
  const lows = a.filter((x) => x < pivot), highs = a.filter((x) => x > pivot);
  const eq = a.length - lows.length - highs.length;
  if (k < lows.length) return select(lows, k);
  if (k < lows.length + eq) return pivot;
  return select(highs, k - lows.length - eq);
}

const a = [12, 3, 5, 7, 4, 19, 26, 1, 14, 8, 22, 17, 9, 30, 2, 11, 25, 6, 15, 20, 28, 10, 13];
console.log('k = 11 ->', select(a, 11));
