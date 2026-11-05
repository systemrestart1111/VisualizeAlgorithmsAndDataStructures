const S = 'banana_bandana', L = 3, B = 131, M = 1000003;

// 前綴雜湊：h[i] = s[0..i) 的多項式雜湊；任意子字串 s[l..r) 的雜湊 = h[r] - h[l]·B^(r-l)，O(1) 取得
const n = S.length, h = [0], pw = [1];
for (let i = 0; i < n; i++) {
  h.push((h[i] * B + S.charCodeAt(i)) % M);
  pw.push((pw[i] * B) % M);
}
const subHash = (l, r) => (((h[r] - h[l] * pw[r - l]) % M) + M) % M;

const groups = new Map(); // 雜湊值 -> 出現位置（依第一次出現的順序）
for (let i = 0; i + L <= n; i++) {
  const v = subHash(i, i + L);
  if (!groups.has(v)) groups.set(v, []);
  groups.get(v).push(i);
}
console.log(`substrings of length ${L} appearing more than once:`);
for (const [v, pos] of groups) {
  const first = S.slice(pos[0], pos[0] + L);
  if (pos.length > 1 && pos.every((p) => S.slice(p, p + L) === first)) // 再確認字串真的相同
    console.log(`  '${first}' hash=${v} at`, pos.join(' '));
}
