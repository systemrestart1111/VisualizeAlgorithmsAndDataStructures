// p[i] = a[0] + … + a[i-1]；區間和 a[l..r] = p[r+1] - p[l]，查詢 O(1)
function buildPrefix(a) {
  const p = [0];
  for (const x of a) p.push(p[p.length - 1] + x);
  return p;
}

const a = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
const p = buildPrefix(a);
console.log('prefix:', p.join(' '));
console.log('sum[2..6] =', p[7] - p[2]);
