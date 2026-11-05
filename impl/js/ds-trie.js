// 每條從根出發的路徑代表一個前綴；end 標記「到這裡是一個完整單字」
class Trie {
  constructor() { this.root = { kids: new Map(), end: false }; this.nodes = 1; }
  insert(w) {
    let cur = this.root;
    for (const ch of w) {
      if (!cur.kids.has(ch)) { cur.kids.set(ch, { kids: new Map(), end: false }); this.nodes++; }
      cur = cur.kids.get(ch);
    }
    cur.end = true;
  }
  find(p) {
    let cur = this.root;
    for (const ch of p) {
      cur = cur.kids.get(ch);
      if (!cur) return null;
    }
    return cur;
  }
  search(w) { const n = this.find(w); return !!n && n.end; }
  startsWith(p) {
    const out = [];
    const dfs = (node, s) => { // 依字母序走訪，收集完整單字
      if (node.end) out.push(s);
      for (const ch of [...node.kids.keys()].sort()) dfs(node.kids.get(ch), s + ch);
    };
    const n = this.find(p);
    if (n) dfs(n, p);
    return out;
  }
  delete(w) {
    if (!this.search(w)) return false;
    const path = [this.root];
    for (const ch of w) path.push(path[path.length - 1].kids.get(ch));
    path[w.length].end = false;
    for (let i = w.length; i > 0; i--) { // 從尾端往回剪掉不再需要的節點
      const node = path[i];
      if (node.end || node.kids.size) break;
      path[i - 1].kids.delete(w[i - 1]);
      this.nodes--;
    }
    return true;
  }
}

const b = (x) => (x ? 'True' : 'False');
const join = (v) => (v.length ? v.join(' ') : '-');

const t = new Trie();
for (const w of ['tea', 'ten', 'to', 'inn', 'in', 'tree', 'try']) t.insert(w);
console.log(`words: ${join(t.startsWith(''))} (nodes = ${t.nodes})`);
console.log(`search tea -> ${b(t.search('tea'))}  search te -> ${b(t.search('te'))} (prefix only)`);
for (const p of ['te', 'tr', 'x']) console.log(`prefix "${p}": ${join(t.startsWith(p))}`);
for (const w of ['in', 'tree', 'tea']) {
  const ok = t.delete(w);
  console.log(`delete ${w} -> ${b(ok)}: ${join(t.startsWith(''))} (nodes = ${t.nodes})`);
}
