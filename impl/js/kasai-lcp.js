// 依原字串順序處理後綴；相鄰後綴的 LCP 最多只會比前一個少 1，因此總共只需 O(n) 次比較
function kasai(s, sa) {
  const n = s.length, rank = new Array(n), lcp = new Array(n).fill(0); // lcp[i] = sa[i] 與 sa[i-1] 的最長共同前綴
  sa.forEach((p, i) => (rank[p] = i));
  for (let i = 0, k = 0; i < n; i++) {
    if (rank[i] === 0) { k = 0; continue; }
    const j = sa[rank[i] - 1];
    while (i + k < n && j + k < n && s[i + k] === s[j + k]) k++;
    lcp[rank[i]] = k;
    if (k) k--;
  }
  return lcp;
}

const s = 'banana$';
const sa = [...Array(s.length).keys()].sort((a, b) => (s.slice(a) < s.slice(b) ? -1 : 1)); // 直接排序後綴取得後綴陣列
const lcp = kasai(s, sa);
console.log(' i  SA LCP suffix');
sa.forEach((p, i) => console.log(`${String(i).padStart(2)} ${String(p).padStart(3)} ${String(lcp[i]).padStart(3)} ${s.slice(p)}`));
