const flip = (a, k) => { for (let i = 0, j = k; i < j; i++, j--) [a[i], a[j]] = [a[j], a[i]]; };

// 只用前綴翻轉：最大值先翻到最前面，再翻到未排序部分的底部
function pancakeSort(a) {
  const flips = [];
  for (let size = a.length; size > 1; size--) {
    let m = 0;
    for (let i = 1; i < size; i++) if (a[i] > a[m]) m = i;
    if (m === size - 1) continue;
    if (m !== 0) { flip(a, m); flips.push(m); }
    flip(a, size - 1);
    flips.push(size - 1);
  }
  return flips;
}

const a = [3, 6, 1, 8, 4, 9, 2, 7, 5];
const f = pancakeSort(a);
console.log('sorted:', a.join(' '));
console.log('flips:', f.length, 'prefix lengths:', f.map((k) => k + 1).join(' '));
