// 雙指標：較矮那一側的最高牆決定該側水位
function trap(h) {
  let l = 0, r = h.length - 1, lm = 0, rm = 0, water = 0;
  while (l < r) {
    if (h[l] < h[r]) { lm = Math.max(lm, h[l]); water += lm - h[l]; l++; }
    else { rm = Math.max(rm, h[r]); water += rm - h[r]; r--; }
  }
  return water;
}
const baseline = (h) => h.reduce((s, x, i) => s + Math.min(Math.max(...h.slice(0, i + 1)), Math.max(...h.slice(i))) - x, 0);

for (const h of [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], [4, 2, 0, 3, 2, 5], [1, 2, 3], [5]]) {
  console.log(`[${h.join(', ')}] water: ${trap(h)} baseline: ${baseline(h)}`);
}
