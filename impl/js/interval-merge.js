// 依左端點排序；touch=true 時相接的閉區間（如 [1,3] 與 [3,5]）也合併
function merge(iv, touch = true) {
  const out = [];
  for (const [l, r] of [...iv].sort((a, b) => a[0] - b[0] || a[1] - b[1])) {
    const last = out[out.length - 1];
    if (last && (touch ? l <= last[1] : l < last[1])) last[1] = Math.max(last[1], r);
    else out.push([l, r]);
  }
  return out;
}

const iv = [[1, 3], [8, 10], [2, 6], [10, 12], [15, 18], [17, 20]];
const fmt = (xs) => xs.map(([l, r]) => `[${l},${r}]`).join(' ');
console.log('merge touching:', fmt(merge(iv)));
console.log('keep touching :', fmt(merge(iv, false)));
console.log('single        :', fmt(merge([[5, 5]])));
