// 分成左右兩半各自排序，再把兩個有序序列合併
function mergeSort(a) {
  if (a.length <= 1) return a;
  const mid = a.length >> 1;
  const left = mergeSort(a.slice(0, mid)), right = mergeSort(a.slice(mid));
  const out = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) out.push(left[i] <= right[j] ? left[i++] : right[j++]);
  return out.concat(left.slice(i), right.slice(j));
}

const a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47];
console.log(mergeSort(a).join(' '));
