// 隨機操作資料結構並與參考集合比對，檢查結構不變量。
import { byId } from '../src/registry';
const mk = (id: string) => (byId[id] as any).create();
let bad = 0;
const fail = (m: string) => { bad++; if (bad < 15) console.log('FAIL', m); };
const ri = (n: number) => Math.floor(Math.random() * n);

function inorder(n: any, out: number[] = []): number[] { if (!n) return out; inorder(n.left, out); out.push(n.val); inorder(n.right, out); return out; }
function checkParents(n: any, p: any): boolean { if (!n) return true; if (n.parent !== p) return false; return checkParents(n.left, n) && checkParents(n.right, n); }
const h = (n: any): number => (n ? 1 + Math.max(h(n.left), h(n.right)) : 0);
function avlOk(n: any): boolean { if (!n) return true; if (Math.abs(h(n.left) - h(n.right)) > 1) return false; if (n.h !== h(n)) return false; return avlOk(n.left) && avlOk(n.right); }

for (const id of ['ds-bst', 'ds-avl', 'ds-splay']) {
  for (let t = 0; t < 40; t++) {
    const d = mk(id); const ref = new Set<number>();
    for (let k = 0; k < 60; k++) {
      const v = ri(40); const op = Math.random() < 0.6 ? 'insert' : 'delete';
      d.apply(op, v); if (op === 'insert') ref.add(v); else ref.delete(v);
      const got = inorder(d.root); const exp = [...ref].sort((a, b) => a - b);
      if (got.join() !== exp.join()) { fail(`${id} contents ${got} vs ${exp}`); break; }
      if (!checkParents(d.root, null)) { fail(`${id} parent pointers`); break; }
      if (id === 'ds-avl' && !avlOk(d.root)) { fail('avl balance'); break; }
      if (id === 'ds-splay' && op === 'insert' && d.root?.val !== v) { fail('splay root'); break; }
    }
  }
}
// 紅黑樹
for (let t = 0; t < 60; t++) {
  const d = mk('ds-red-black'); const ref = new Set<number>();
  const N = d.NIL;
  const ino = (n: any, o: number[] = []): number[] => { if (n === N) return o; ino(n.left, o); o.push(n.val); ino(n.right, o); return o; };
  const bh = (n: any): number => { if (n === N) return 1; const l = bh(n.left), r = bh(n.right); if (l < 0 || r < 0 || l !== r) return -1; if (n.red && (n.left.red || n.right.red)) return -1; return l + (n.red ? 0 : 1); };
  for (let k = 0; k < 80; k++) {
    const v = ri(50); const op = Math.random() < 0.6 ? 'insert' : 'delete';
    d.apply(op, v); if (op === 'insert') ref.add(v); else ref.delete(v);
    if (ino(d.root).join() !== [...ref].sort((a, b) => a - b).join()) { fail('rb contents'); break; }
    if (d.root.red || bh(d.root) < 0) { fail('rb invariant'); break; }
  }
}
// B 樹
for (const id of ['ds-b-tree', 'ds-b-plus-tree']) {
  for (let t = 0; t < 60; t++) {
    const d = mk(id); const ref = new Set<number>();
    for (let k = 0; k < 80; k++) {
      const v = ri(60); const op = Math.random() < 0.6 ? 'insert' : 'delete';
      d.apply(op, v); if (op === 'insert') ref.add(v); else ref.delete(v);
      const keys: number[] = []; const depths = new Set<number>(); let okSize = true;
      const walk = (n: any, dep: number) => {
        if (n.leaf) { depths.add(dep); keys.push(...n.keys); }
        else { if (id === 'ds-b-tree') keys.push(...n.keys); if (n.kids.length !== n.keys.length + 1) okSize = false; n.kids.forEach((c: any) => walk(c, dep + 1)); }
        const max = id === 'ds-b-tree' ? 2 * d.t - 1 : d.M - 1;
        const min = id === 'ds-b-tree' ? d.t - 1 : Math.ceil(d.M / 2) - 1;
        if (n.keys.length > max) okSize = false;
        if (n !== d.root && n.keys.length < min) okSize = false;
      };
      walk(d.root, 0);
      const exp = [...ref].sort((a, b) => a - b);
      const got = id === 'ds-b-tree' ? [...keys].sort((a, b) => a - b) : keys;
      if (got.join() !== exp.join()) { fail(`${id} keys ${got} vs ${exp} after ${op} ${v}`); break; }
      if (depths.size > 1) { fail(`${id} leaf depth`); break; }
      if (!okSize) { fail(`${id} node size after ${op} ${v}`); break; }
      if (id === 'ds-b-plus-tree') { const ll: number[] = []; let x = d.root; while (!x.leaf) x = x.kids[0]; for (; x; x = x.next) ll.push(...x.keys); if (ll.join() !== exp.join()) { fail('b+ leaf chain'); break; } }
    }
  }
}
// 跳躍串列
for (let t = 0; t < 40; t++) {
  const d = mk('ds-skip-list'); const ref = new Set<number>();
  for (let k = 0; k < 80; k++) {
    const v = ri(50); const op = Math.random() < 0.6 ? 'insert' : 'delete';
    d.apply(op, v); if (op === 'insert') ref.add(v); else ref.delete(v);
    for (let lv = 0; lv < d.level; lv++) { const ks: number[] = []; for (let x = d.head.next[lv]; x; x = x.next[lv]) ks.push(x.key); if (ks.join() !== [...ks].sort((a, b) => a - b).join()) { fail('skip order'); } if (lv === 0 && ks.join() !== [...ref].sort((a, b) => a - b).join()) fail('skip contents'); }
  }
}
// 雜湊表
for (const id of ['ds-hash-chaining', 'ds-hash-open']) {
  for (let t = 0; t < 40; t++) {
    const d = mk(id); const ref = new Set<number>();
    for (let k = 0; k < 60; k++) {
      const v = ri(100); const r = Math.random();
      if (k % 20 === 5 && id === 'ds-hash-open') d.apply('mode', ['linear', 'quadratic', 'double'][ri(3)]);
      if (r < 0.55) { d.apply('insert', v); ref.add(v); } else { d.apply('delete', v); ref.delete(v); }
      const got = (id === 'ds-hash-chaining' ? d.b.flat() : d.t.filter((x: any) => x !== null && x !== -1)).sort((a: number, b: number) => a - b);
      if (got.join() !== [...ref].sort((a, b) => a - b).join()) { fail(`${id} contents`); break; }
      const f = d.apply('search', v); const msg = f[f.length - 1].msg;
      if (ref.has(v) !== /找到/.test(msg)) { fail(`${id} search ${v}: ${msg}`); break; }
    }
  }
}
// 線段樹 / 樹狀陣列
for (let t = 0; t < 40; t++) {
  const s = mk('ds-segment-tree'); const ref = [...s.a];
  for (let k = 0; k < 40; k++) {
    const l = ri(8), r = l + ri(8 - l);
    if (Math.random() < 0.5) { s.apply('add', l, r); for (let i = l; i <= r; i++) ref[i] += 3; }
    else { const i = ri(8), v = ri(9); s.apply('set', i, v); ref[i] = v; }
    const f = s.apply('query', l, r); const got = Number(f[f.length - 1].msg.match(/= (-?\d+)$/)[1]);
    if (got !== ref.slice(l, r + 1).reduce((a, b) => a + b, 0)) { fail('segtree'); break; }
  }
  const fw = mk('ds-fenwick'); const fr = [...fw.a];
  for (let k = 0; k < 40; k++) {
    const i = 1 + ri(12), v = ri(9) - 3; fw.apply('add', i, v); fr[i - 1] += v;
    const l = 1 + ri(12), r = l + ri(13 - l);
    const f = fw.apply('range', l, r); const got = Number(f[f.length - 1].msg.match(/= (-?\d+)$/)[1]);
    if (got !== fr.slice(l - 1, r).reduce((a, b) => a + b, 0)) { fail('fenwick'); break; }
  }
}
// 堆積
for (let t = 0; t < 40; t++) {
  const d = mk('ds-heap'); const ref: number[] = [];
  for (let k = 0; k < 50; k++) {
    if (Math.random() < 0.6) { const v = ri(99); d.apply('insert', v); ref.push(v); } else if (ref.length) { d.apply('extract'); ref.sort((a, b) => a - b).shift(); }
    for (let i = 1; i < d.h.length; i++) if (d.h[(i - 1) >> 1] > d.h[i]) { fail('heap property'); break; }
    if ([...d.h].sort((a, b) => a - b).join() !== [...ref].sort((a, b) => a - b).join()) { fail('heap contents'); break; }
  }
}
console.log('invariant failures:', bad);
process.exit(bad ? 1 : 0);
