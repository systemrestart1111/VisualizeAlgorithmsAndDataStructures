// f(m, e) = f(m−1, e−1) + f(m−1, e) + 1：m 次、e 顆蛋最多能區分的樓層數
function minDrops(k, n) {
  if (n === 0) return 0;
  const f = new Array(k + 1).fill(0);
  let m = 0;
  while (f[k] < n) {
    m++;
    for (let e = k; e >= 1; e--) f[e] = f[e - 1] + f[e] + 1;
  }
  return m;
}

for (const [k, n] of [[2, 36], [1, 10], [3, 100], [2, 0], [2, 100], [4, 5000]]) console.log(`${k} eggs, ${n} floors: ${minDrops(k, n)} drops`);
