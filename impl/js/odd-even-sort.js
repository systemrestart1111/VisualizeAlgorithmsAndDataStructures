// 奇偶換位排序：交替比較 (奇, 偶) 與 (偶, 奇) 相鄰對，直到沒有交換
function oddEvenSort(a) {
  let done = false;
  while (!done) {
    done = true;
    for (const start of [1, 0])
      for (let i = start; i + 1 < a.length; i += 2)
        if (a[i] > a[i + 1]) {
          [a[i], a[i + 1]] = [a[i + 1], a[i]];
          done = false;
        }
  }
}

const a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72];
oddEvenSort(a);
console.log(a.join(' '));
