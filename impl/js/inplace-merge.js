// a[0..mid) 與 a[mid..n) 各自有序；不用額外陣列，把右段元素依序往左插入（O(n·m)）
function inplaceMerge(a, mid) {
  let i = 0, j = mid;
  while (i < j && j < a.length) {
    if (a[i] <= a[j]) i++;
    else {
      const v = a[j];
      for (let k = j; k > i; k--) a[k] = a[k - 1]; // a[i..j-1] 整段右移一格
      a[i++] = v;
      j++;
    }
  }
}

const a = [3, 8, 15, 22, 40, 1, 9, 10, 25, 30, 45];
inplaceMerge(a, 5);
console.log(a.join(' '));
