// a 先升後降（單峰）；每次取兩個三等分點，捨棄不可能含峰值的那一段
function ternarySearchPeak(a) {
  let lo = 0, hi = a.length - 1;
  while (hi - lo > 2) {
    const m1 = lo + Math.floor((hi - lo) / 3);
    const m2 = hi - Math.floor((hi - lo) / 3);
    if (a[m1] < a[m2]) lo = m1 + 1;
    else hi = m2 - 1;
  }
  let best = lo;
  for (let i = lo + 1; i <= hi; i++) if (a[i] > a[best]) best = i;
  return best;
}

const a = [3, 9, 14, 22, 31, 40, 52, 47, 38, 26, 17, 11, 5];
const p = ternarySearchPeak(a);
console.log('peak index =', p, 'value =', a[p]);
