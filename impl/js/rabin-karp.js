// 比較雜湊值取代逐字比較；視窗右移一格時用 O(1) 更新雜湊（滾動雜湊）。雜湊相同時仍需確認，避免碰撞
function rabinKarp(t, p, q, d = 256) {
  const n = t.length, m = p.length;
  let h = 1, hp = 0, ht = 0;
  for (let i = 0; i < m - 1; i++) h = (h * d) % q; // 最高位的權重
  for (let i = 0; i < m; i++) {
    hp = (hp * d + p.charCodeAt(i)) % q;
    ht = (ht * d + t.charCodeAt(i)) % q;
  }
  const matches = [], spurious = [];
  for (let s = 0; s + m <= n; s++) {
    if (hp === ht) (t.startsWith(p, s) ? matches : spurious).push(s);
    if (s < n - m) ht = ((((ht - t.charCodeAt(s) * h) * d + t.charCodeAt(s + m)) % q) + q) % q; // JS 的 % 可能是負數
  }
  return [matches, spurious];
}

const [m, sp] = rabinKarp('31415926535897932384626', '26', 13);
console.log('matches at:', m.join(' '));
console.log('spurious hits (hash collision):', sp.join(' '));
