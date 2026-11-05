// 對答案二分：hours(k) 隨 k 遞減，找最小可行的 k；h < 堆數時無解
function minSpeed(piles, h) {
  if (h < piles.length) return null;
  const hours = (k) => piles.reduce((s, p) => s + Math.ceil(p / k), 0);
  let lo = 1, hi = Math.max(...piles);
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (hours(mid) <= h) hi = mid; else lo = mid + 1;
  }
  return lo;
}

const piles = [30, 11, 23, 4, 20];
for (const h of [6, 5, 10, 100, 4]) console.log(`h = ${h}: min speed = ${minSpeed(piles, h) ?? 'impossible'}`);
