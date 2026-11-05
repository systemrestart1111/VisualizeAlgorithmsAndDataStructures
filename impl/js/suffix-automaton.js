// 逐字元擴充；len 不連續時複製 clone。回傳 [len, link]
function buildSam(s) {
  const len = [0], link = [-1], nxt = [new Map()];
  let last = 0;
  for (const c of s) {
    const cur = len.length;
    len.push(len[last] + 1); link.push(-1); nxt.push(new Map());
    let p = last;
    while (p !== -1 && !nxt[p].has(c)) { nxt[p].set(c, cur); p = link[p]; }
    if (p === -1) link[cur] = 0;
    else {
      const q = nxt[p].get(c);
      if (len[p] + 1 === len[q]) link[cur] = q;
      else {
        const clone = len.length;
        len.push(len[p] + 1); link.push(link[q]); nxt.push(new Map(nxt[q]));
        while (p !== -1 && nxt[p].get(c) === q) { nxt[p].set(c, clone); p = link[p]; }
        link[q] = link[cur] = clone;
      }
    }
    last = cur;
  }
  return [len, link];
}

for (const s of ['abcbcabc', 'banana', 'aaaa', 'abcd']) {
  const [len, link] = buildSam(s);
  let distinct = 0;
  for (let v = 1; v < len.length; v++) distinct += len[v] - len[link[v]];
  const subs = new Set();
  for (let i = 0; i < s.length; i++) for (let j = i + 1; j <= s.length; j++) subs.add(s.slice(i, j));
  console.log(`${s}: states ${len.length}, distinct substrings ${distinct} (brute ${subs.size})`);
}
