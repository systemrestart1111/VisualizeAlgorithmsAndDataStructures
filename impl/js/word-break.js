const DICT = ['apple', 'pen', 'applepen', 'pine', 'pineapple', 'cats', 'dog', 'sand', 'and', 'cat'];

// dp[i] = 前 i 個字元的切法數；從每個可到達的 i 沿字典樹往後比對
function wordBreak(s, words) {
  const trie = [new Map()], end = [null];
  for (const w of words) {
    let u = 0;
    for (const ch of w) { if (!trie[u].has(ch)) { trie[u].set(ch, trie.length); trie.push(new Map()); end.push(null); } u = trie[u].get(ch); }
    end[u] = w;
  }
  const n = s.length, dp = new Array(n + 1).fill(0), first = new Array(n + 1).fill(null);
  dp[0] = 1;
  for (let i = 0; i < n; i++) {
    if (!dp[i]) continue;
    for (let u = 0, j = i; j < n && trie[u].has(s[j]);) {
      u = trie[u].get(s[j]);
      j++;
      if (end[u]) { dp[j] += dp[i]; if (!first[j]) first[j] = [i, end[u]]; }
    }
  }
  const parts = [];
  if (dp[n]) for (let j = n; j > 0;) { const [i, w] = first[j]; parts.unshift(w); j = i; }
  return [dp[n], parts];
}

for (const s of ['pineapplepenapple', 'catsanddog', 'catsandog', '']) {
  const [ways, parts] = wordBreak(s, DICT);
  console.log(`'${s}': ${ways} ways` + (ways && parts.length ? `, e.g. ${parts.join(' ')}` : ''));
}
