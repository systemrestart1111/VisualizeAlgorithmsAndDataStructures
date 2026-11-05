const ADJ = { 1: [1, 2], 2: [1, 3], 3: [2, 3], 4: [3, 4], 5: [4, 5] }; // 左側 L1..L5 可以配對的右側點
const matchR = {}; // 右側點 -> 目前配到的左側點

// 替 u 找右側點：若對方空著就直接配；若已被配走，嘗試讓原本的左側點改配別人（增廣路徑）
function tryKuhn(u, seen) {
  for (const v of ADJ[u]) {
    if (seen.has(v)) continue;
    seen.add(v);
    if (!(v in matchR) || tryKuhn(matchR[v], seen)) { matchR[v] = u; return true; }
  }
  return false;
}

let size = 0;
for (const u of [1, 2, 3, 4, 5]) if (tryKuhn(u, new Set())) size++;
console.log('matching size =', size);
for (const [v, u] of Object.entries(matchR).sort((a, b) => a[1] - b[1])) console.log(`L${u} - R${v}`);
