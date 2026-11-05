const ITEMS = [[10, 60], [20, 100], [30, 120], [5, 50], [15, 45]]; // (重量, 價值)
let left = 50, total = 0;

// 依「單位重量價值」由高到低裝；最後一件裝不下就只裝一部分
const order = ITEMS.map((_, i) => i).sort((a, b) => ITEMS[b][1] / ITEMS[b][0] - ITEMS[a][1] / ITEMS[a][0]);
for (const i of order) {
  if (left === 0) break;
  const [w, v] = ITEMS[i], take = Math.min(w, left);
  total += (v * take) / w;
  left -= take;
  console.log(`item ${i} (w=${w}, v=${v}, ratio=${(v / w).toFixed(2)}): take ${take}/${w}`);
}
console.log(`total value = ${total.toFixed(2)}`);
