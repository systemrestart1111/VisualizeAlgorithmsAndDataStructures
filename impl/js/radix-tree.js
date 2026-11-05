const node = () => ({ end: false, kids: new Map() }); // 首字元 → [邊標籤, 子節點]

// 共享一部分的邊要在分岔處分裂
function insert(root, w) {
  let n = root, i = 0;
  while (i < w.length) {
    const e = n.kids.get(w[i]);
    if (!e) { const leaf = node(); leaf.end = true; n.kids.set(w[i], [w.slice(i), leaf]); return; }
    const [label, child] = e;
    let k = 0;
    while (k < label.length && i + k < w.length && label[k] === w[i + k]) k++;
    if (k === label.length) { n = child; i += k; continue; }
    const mid = node();
    mid.kids.set(label[k], [label.slice(k), child]);
    n.kids.set(w[i], [label.slice(0, k), mid]);
    n = mid; i += k;
  }
  n.end = true;
}
// 回傳 [停下的節點, 是否停在邊的中間]；找不到時節點為 null
function walk(root, w) {
  let n = root, i = 0;
  while (i < w.length) {
    const e = n.kids.get(w[i]);
    if (!e) return [null, false];
    const [label, child] = e;
    const part = w.slice(i, i + label.length);
    if (!label.startsWith(part)) return [null, false];
    if (part.length < label.length) return [child, true];
    n = child; i += label.length;
  }
  return [n, false];
}
const count = (n) => (n.end ? 1 : 0) + [...n.kids.values()].reduce((s, [, c]) => s + count(c), 0);
function dump(n, depth = 0) {
  for (const ch of [...n.kids.keys()].sort()) {
    const [label, c] = n.kids.get(ch);
    console.log('  '.repeat(depth) + label + (c.end ? '*' : ''));
    dump(c, depth + 1);
  }
}

const root = node();
for (const w of ['romane', 'romanus', 'romulus', 'rubens', 'ruber', 'rubicon', 'rubicundus', 'rom']) insert(root, w);
dump(root);
for (const w of ['rom', 'romane', 'rub', 'roman']) { const [n, mid] = walk(root, w); console.log(`search ${w}:`, n && !mid && n.end ? 'True' : 'False'); }
for (const p of ['r', 'rom', 'rub', 'rubi', 'ru', 'x']) { const [n] = walk(root, p); console.log(`prefix ${p}:`, n ? count(n) : 0); }
