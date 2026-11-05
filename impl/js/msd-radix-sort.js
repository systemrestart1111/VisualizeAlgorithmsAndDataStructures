// 依第 d 個字元分桶；在第 d 位已結束的字串放在最前面的結尾桶
function msd(words, d = 0) {
  if (words.length <= 1) return [...words];
  const out = [], buckets = new Map();
  for (const w of words) {
    if (w.length <= d) out.push(w);
    else { if (!buckets.has(w[d])) buckets.set(w[d], []); buckets.get(w[d]).push(w); }
  }
  for (const ch of [...buckets.keys()].sort()) out.push(...msd(buckets.get(ch), d + 1));
  return out;
}

console.log(msd('she sells sea shells by the sea shore app apple ape'.split(' ')).join(' '));
console.log(msd(['b', 'a', '', 'ab', 'abc', 'aa', 'a']).join(' '));
