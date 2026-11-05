function reverse(a, i, j) {
  while (i < j) { [a[i], a[j]] = [a[j], a[i]]; i++; j--; }
}

// 三次反轉：整段反轉，再分別反轉前 k 個與其餘部分
function rotateRight(a, k) {
  const n = a.length;
  k %= n;
  reverse(a, 0, n - 1);
  reverse(a, 0, k - 1);
  reverse(a, k, n - 1);
}

const a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
rotateRight(a, 3);
console.log(a.join(' '));
