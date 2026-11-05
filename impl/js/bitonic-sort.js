// 雙調排序（n 為 2 的冪）：比較網路，每一層的比較互不相依，適合平行硬體
function bitonicSort(a) {
  const n = a.length;
  for (let k = 2; k <= n; k *= 2)
    for (let j = k >> 1; j > 0; j >>= 1)
      for (let i = 0; i < n; i++) {
        const p = i ^ j;
        if (p > i) {
          const up = (i & k) === 0;
          if ((a[i] > a[p]) === up) [a[i], a[p]] = [a[p], a[i]];
        }
      }
}

const a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47, 90, 14];
bitonicSort(a);
console.log(a.join(' '));
