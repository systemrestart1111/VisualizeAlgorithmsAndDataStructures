// 比較間隔 gap 的元素，gap 每輪除以 1.3；gap 縮到 1 且沒有交換時結束
function combSort(a) {
  let gap = a.length, done = false;
  while (!done) {
    gap = Math.max(1, Math.floor(gap / 1.3));
    done = gap === 1;
    for (let i = 0; i + gap < a.length; i++)
      if (a[i] > a[i + gap]) {
        [a[i], a[i + gap]] = [a[i + gap], a[i]];
        done = false;
      }
  }
}

const a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72];
combSort(a);
console.log(a.join(' '));
