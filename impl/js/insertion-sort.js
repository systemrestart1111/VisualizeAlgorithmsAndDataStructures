// 把每個元素往前插入到已排序部分的正確位置
function insertionSort(a) {
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
  }
}

const a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72];
insertionSort(a);
console.log(a.join(' '));
