const PATTERNS = ['he', 'she', 'his', 'hers'], TEXT = 'ushershishe';

// 1. 把所有樣式插入字典樹
const children = [{}], fail = [0], out = [-1], dictLink = [0];
PATTERNS.forEach((p, idx) => {
  let u = 0;
  for (const ch of p) {
    if (!(ch in children[u])) {
      children.push({}); fail.push(0); out.push(-1); dictLink.push(0);
      children[u][ch] = children.length - 1;
    }
    u = children[u][ch];
  }
  out[u] = idx;
});

// 2. BFS 建立失配指標：fail[v] = v 所代表字串的最長「也在字典樹中」的真後綴
const q = Object.values(children[0]);
for (let h = 0; h < q.length; h++) {
  const u = q[h];
  for (const ch of Object.keys(children[u]).sort()) {
    const v = children[u][ch];
    let f = fail[u];
    while (f && !(ch in children[f])) f = fail[f];
    fail[v] = ch in children[f] && children[f][ch] !== v ? children[f][ch] : 0;
    dictLink[v] = out[fail[v]] >= 0 ? fail[v] : dictLink[fail[v]]; // 沿失配鏈第一個樣式終點
    q.push(v);
  }
}

// 3. 掃描文字一次：失配就沿 fail 退回，每到一個節點就輸出它及其輸出鏈上的所有樣式
let u = 0;
[...TEXT].forEach((ch, i) => {
  while (u && !(ch in children[u])) u = fail[u];
  u = children[u][ch] ?? 0;
  for (let x = out[u] >= 0 ? u : dictLink[u]; x; x = dictLink[x]) {
    const p = PATTERNS[out[x]];
    console.log(`pos ${i - p.length + 1}: ${p}`);
  }
});
