// 把每個值換成它在「排序後去重複」陣列中的排名
function compress(a) {
  const vals = [...new Set(a)].sort((x, y) => x - y);
  const rank = (x) => { let lo = 0, hi = vals.length; while (lo < hi) { const m = (lo + hi) >> 1; if (vals[m] < x) lo = m + 1; else hi = m; } return lo; };
  return [a.map(rank), vals];
}

const a = [1000000, 30, -5, 30, 99999, 7, -5, 2000];
const [ranks, vals] = compress(a);
console.log('values:', vals.join(' '));
console.log('ranks :', ranks.join(' '));
const ok = a.every((x, i) => a.every((y, j) => (x < y) === (ranks[i] < ranks[j]) && (x === y) === (ranks[i] === ranks[j])));
console.log('order preserved:', ok ? 'True' : 'False');
