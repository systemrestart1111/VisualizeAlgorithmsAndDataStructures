// 已排序陣列：和太小移左指標、太大移右指標
function twoSumSorted(a, t) {
  let l = 0, r = a.length - 1;
  while (l < r) {
    const s = a[l] + a[r];
    if (s === t) return [l, r];
    if (s < t) l++; else r--;
  }
  return null;
}

const a = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
for (const t of [61, 100, 4, 163]) {
  let brute = false;
  for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] + a[j] === t) brute = true;
  const p = twoSumSorted(a, t);
  console.log(`t = ${t}: ${p ? `a[${p[0]}] + a[${p[1]}] = ${a[p[0]]} + ${a[p[1]]}` : 'none'} | brute: ${brute ? 'True' : 'False'}`);
}
