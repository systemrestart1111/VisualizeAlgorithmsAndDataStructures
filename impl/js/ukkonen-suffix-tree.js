// Ukkonen：葉子共用全域 end；active point 記住插入位置；新內部節點以 suffix link 串接
function build(t) {
  const leafEnd = { v: -1 };
  const node = (start, end) => ({ start, end, kids: new Map(), link: null });
  const len = (n) => n.end.v - n.start + 1;
  const root = node(-1, { v: -1 });
  root.link = root;
  let aNode = root, aEdge = 0, aLen = 0, rem = 0;
  for (let i = 0; i < t.length; i++) {
    leafEnd.v = i;
    rem++;
    let lastNew = null;
    while (rem > 0) {
      if (aLen === 0) aEdge = i;
      const ch = t[aEdge];
      if (!aNode.kids.has(ch)) {
        aNode.kids.set(ch, node(i, leafEnd));
        if (lastNew) { lastNew.link = aNode; lastNew = null; }
      } else {
        const nx = aNode.kids.get(ch);
        if (aLen >= len(nx)) { aEdge += len(nx); aLen -= len(nx); aNode = nx; continue; }
        if (t[nx.start + aLen] === t[i]) {
          if (lastNew && aNode !== root) { lastNew.link = aNode; lastNew = null; }
          aLen++;
          break;
        }
        const split = node(nx.start, { v: nx.start + aLen - 1 });
        split.link = root;
        aNode.kids.set(ch, split);
        split.kids.set(t[i], node(i, leafEnd));
        nx.start += aLen;
        split.kids.set(t[nx.start], nx);
        if (lastNew) lastNew.link = split;
        lastNew = split;
      }
      rem--;
      if (aNode === root && aLen > 0) { aLen--; aEdge = i - rem + 1; }
      else if (aNode !== root) aNode = aNode.link;
    }
  }
  return root;
}
// 依邊的首字元字典序 DFS，葉子的出現順序就是後綴陣列
function suffixArray(root, total) {
  const out = [];
  const dfs = (n, depth) => {
    if (!n.kids.size) { out.push(total - depth); return; }
    for (const ch of [...n.kids.keys()].sort()) { const k = n.kids.get(ch); dfs(k, depth + k.end.v - k.start + 1); }
  };
  dfs(root, 0);
  return out;
}

for (const s of ['banana', 'abcabxabcd', 'mississippi', 'aaaa']) {
  const t = s + '$';
  const sa = suffixArray(build(t), t.length);
  const naive = [...t].map((_, i) => i).sort((a, b) => (t.slice(a) < t.slice(b) ? -1 : 1));
  console.log(`${t}: leaves ${sa.length}, suffix array [${sa.join(', ')}], matches naive ${sa.join() === naive.join() ? 'True' : 'False'}`);
}
