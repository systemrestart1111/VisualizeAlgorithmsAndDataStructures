// 試除法：從 2 開始除，能整除就一直除；試到 √n 為止，剩下的若大於 1 就是最後一個質因數
function factorize(n) {
  const f = [];
  for (let d = 2; d * d <= n; d++) {
    let e = 0;
    while (n % d === 0) { n /= d; e++; }
    if (e) f.push([d, e]);
  }
  if (n > 1) f.push([n, 1]);
  return f;
}

console.log('360360 =', factorize(360360).map(([p, e]) => (e > 1 ? `${p}^${e}` : String(p))).join(' x '));
