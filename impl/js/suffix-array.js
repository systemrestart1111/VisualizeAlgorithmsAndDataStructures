// 倍增法：先依第 1 個字元排名，之後每輪用 (前 k 字元排名, 接下來 k 字元排名) 排序，比較長度每輪加倍
function suffixArray(s) {
  const n = s.length, sa = [...Array(s.length).keys()];
  let rank = [...s].map((ch) => ch.charCodeAt(0));
  for (let k = 1; ; k *= 2) {
    const key = (i) => [rank[i], i + k < n ? rank[i + k] : -1];
    const cmp = (a, b) => key(a)[0] - key(b)[0] || key(a)[1] - key(b)[1];
    sa.sort(cmp);
    const nw = new Array(n).fill(0);
    for (let j = 1; j < n; j++) nw[sa[j]] = nw[sa[j - 1]] + (cmp(sa[j - 1], sa[j]) !== 0 ? 1 : 0);
    rank = nw;
    console.log(`k=${k}: ranks`, rank.join(' '));
    if (rank[sa[n - 1]] === n - 1) return sa; // 排名全部不同就完成
  }
}

const s = 'banana$';
const sa = suffixArray(s);
console.log('SA:', sa.join(' '));
for (const i of sa) console.log(`${String(i).padStart(2)} ${s.slice(i)}`);
