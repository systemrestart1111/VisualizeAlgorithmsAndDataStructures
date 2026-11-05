// 把 a[i] 往下沉，直到它比兩個子節點都大（最大堆積）
function siftDown(a, i, n) {
  for (;;) {
    let big = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && a[l] > a[big]) big = l;
    if (r < n && a[r] > a[big]) big = r;
    if (big === i) return;
    [a[i], a[big]] = [a[big], a[i]];
    i = big;
  }
}

function heapSort(a) {
  const n = a.length;
  for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(a, i, n); // 由下往上建堆
  for (let end = n - 1; end > 0; end--) {                    // 每次把最大值換到尾端
    [a[0], a[end]] = [a[end], a[0]];
    siftDown(a, 0, end);
  }
}

const a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72];
heapSort(a);
console.log(a.join(' '));
