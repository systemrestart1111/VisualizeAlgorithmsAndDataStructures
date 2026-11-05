// 統計每個值出現的次數，再用前綴和決定每個元素的最終位置（穩定）
function countingSort(a) {
  const k = Math.max(...a) + 1;
  const cnt = new Array(k).fill(0), out = new Array(a.length);
  for (const x of a) cnt[x]++;
  for (let v = 1; v < k; v++) cnt[v] += cnt[v - 1];
  for (let i = a.length - 1; i >= 0; i--) out[--cnt[a[i]]] = a[i];
  return out;
}

const a = [4, 2, 7, 1, 4, 9, 3, 2, 7, 0, 5, 4, 8, 1];
console.log(countingSort(a).join(' '));
