// 合併排序：右邊元素先被取出時，左半剩下的都比它大；相等先取左邊（不算逆序）
function count(a) {
  if (a.length <= 1) return [a, 0];
  const m = a.length >> 1;
  const [left, x] = count(a.slice(0, m)), [right, y] = count(a.slice(m));
  const out = [];
  let i = 0, j = 0, c = x + y;
  while (i < left.length || j < right.length) {
    if (j === right.length || (i < left.length && left[i] <= right[j])) out.push(left[i++]);
    else { c += left.length - i; out.push(right[j++]); }
  }
  return [out, c];
}

for (const a of [[8, 4, 2, 1, 7, 3, 5, 3], [1, 2, 3], [3, 3, 3], [5, 4, 3, 2, 1]]) {
  let brute = 0;
  for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] > a[j]) brute++;
  console.log(`[${a.join(', ')}] inversions: ${count(a)[1]} brute: ${brute}`);
}
