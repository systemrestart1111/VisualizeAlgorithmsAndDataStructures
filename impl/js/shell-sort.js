// 間隔 gap 從 n/2 逐次減半，對每個間隔做插入排序；最後 gap = 1 時就是一般的插入排序
function shellSort(a) {
  const n = a.length;
  for (let gap = n >> 1; gap > 0; gap >>= 1)
    for (let i = gap; i < n; i++) {
      const key = a[i];
      let j = i;
      while (j >= gap && a[j - gap] > key) {
        a[j] = a[j - gap];
        j -= gap;
      }
      a[j] = key;
    }
}

const a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72];
shellSort(a);
console.log(a.join(' '));
