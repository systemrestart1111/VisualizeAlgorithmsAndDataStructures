// 每一輪從未排序部分選出最小值，放到未排序部分的開頭
function selectionSort(a) {
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let m = i;
    for (let j = i + 1; j < n; j++) if (a[j] < a[m]) m = j;
    [a[i], a[m]] = [a[m], a[i]];
  }
}

const a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72];
selectionSort(a);
console.log(a.join(' '));
