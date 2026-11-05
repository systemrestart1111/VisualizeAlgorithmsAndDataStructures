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

// ---------------- 擴充資料結構 ----------------
const sortedNum = (xs: Iterable<number>) => [...xs].sort((a, b) => a - b);
// 樹堆：BST 順序 + 最大堆積優先權
for (let t = 0; t < 40; t++) {
  const d = mk('treap'); const ref = new Set<number>();
  const ok = (n: any): boolean => !n || ((!n.left || (n.left.val < n.val && n.left.pri <= n.pri)) && (!n.right || (n.right.val > n.val && n.right.pri <= n.pri)) && ok(n.left) && ok(n.right));
  for (let k = 0; k < 60; k++) {
    const v = ri(40); const op = Math.random() < 0.6 ? 'insert' : 'delete';
    d.apply(op, v); if (op === 'insert') ref.add(v); else ref.delete(v);
    if (inorder(d.root).join() !== sortedNum(ref).join()) { fail('treap contents'); break; }
    if (!ok(d.root)) { fail('treap heap/bst'); break; }
  }
}
// 順序統計樹：size、平衡、select／rank
for (let t = 0; t < 40; t++) {
  const d = mk('order-statistic-tree'); const ref = new Set<number>();
  const sz = (n: any): number => (n ? 1 + sz(n.left) + sz(n.right) : 0);
  const good = (n: any): boolean => !n || (n.size === sz(n) && Math.abs(h(n.left) - h(n.right)) <= 1 && good(n.left) && good(n.right));
  for (let k = 0; k < 60; k++) {
    const v = ri(50); const op = Math.random() < 0.6 ? 'insert' : 'delete';
    d.apply(op, v); if (op === 'insert') ref.add(v); else ref.delete(v);
    const exp = sortedNum(ref);
    if (inorder(d.root).join() !== exp.join() || !good(d.root)) { fail('ost structure'); break; }
    if (exp.length) {
      const kk = 1 + ri(exp.length); const f = d.apply('select', kk);
      if (!f[f.length - 1].msg.includes(`答案就是 ${exp[kk - 1]}`)) { fail(`ost select ${kk}`); break; }
      const x = ri(55); const g = d.apply('rank', x);
      if (!g[g.length - 1].msg.endsWith(`rank(${x}) = ${exp.filter((y) => y < x).length + 1}`)) { fail(`ost rank ${x}`); break; }
    }
  }
}
// 布隆／計數布隆：插入過的不可漏判
for (const id of ['bloom-filter', 'counting-bloom']) {
  for (let t = 0; t < 20; t++) {
    const d = mk(id); const ins: string[] = [];
    for (let k = 0; k < 12; k++) { const w = 'w' + ri(40); d.apply('insert', w); ins.push(w); }
    if (id === 'counting-bloom') for (let k = 0; k < 4; k++) { const w = ins.splice(ri(ins.length), 1)[0]; d.apply('delete', w); }
    for (const w of ins) { const f = d.apply('query', w); if (!/可能存在/.test(f[f.length - 1].msg)) { fail(`${id} false negative ${w}`); break; } }
  }
}
// Count–Min：估計 ≥ 真實
for (let t = 0; t < 20; t++) {
  const d = mk('count-min-sketch');
  for (let k = 0; k < 30; k++) d.apply('update', `k${ri(12)} ${1 + ri(3)}`);
  for (const [w, c] of d.truth) { const est = Math.min(...d.idx(w).map((j: number, i: number) => d.t[i][j])); if (est < c) { fail('count-min underestimate'); break; } }
}
// LRU／LFU 與參考實作比對
for (let t = 0; t < 30; t++) {
  const d = mk('lru-cache'); d.apply('put', 1, 10); d.apply('put', 2, 20); d.apply('put', 3, 30);
  const ref: [number, number][] = [[3, 30], [2, 20], [1, 10]]; const cap = 3;
  for (let k = 0; k < 40; k++) {
    const key = 1 + ri(6);
    if (Math.random() < 0.5) { const v = ri(99); d.apply('put', key, v); const i = ref.findIndex((e) => e[0] === key); if (i >= 0) ref.splice(i, 1); else if (ref.length >= cap) ref.pop(); ref.unshift([key, v]); }
    else { d.apply('get', key); const i = ref.findIndex((e) => e[0] === key); if (i >= 0) ref.unshift(ref.splice(i, 1)[0]); }
    if (d.order.map((e: any) => `${e.k}:${e.v}`).join() !== ref.map((e) => e.join(':')).join()) { fail('lru order'); break; }
  }
}
for (let t = 0; t < 30; t++) {
  const d = mk('lfu-cache'); d.apply('put', 1, 10); d.apply('put', 2, 20); d.apply('get', 1); d.apply('put', 3, 30);
  const cap = 3;
  const ref = new Map<number, { v: number; f: number; last: number }>([[1, { v: 10, f: 2, last: 3 }], [2, { v: 20, f: 1, last: 2 }], [3, { v: 30, f: 1, last: 4 }]]);
  let tick = 4;
  for (let k = 0; k < 40; k++) {
    const key = 1 + ri(6); tick++;
    if (Math.random() < 0.5) {
      const v = ri(99); d.apply('put', key, v);
      const e = ref.get(key);
      if (e) { e.v = v; e.f++; e.last = tick; }
      else { if (ref.size >= cap) { let worst = -1, wf = Infinity, wl = Infinity; for (const [kk, x] of ref) if (x.f < wf || (x.f === wf && x.last < wl)) { worst = kk; wf = x.f; wl = x.last; } ref.delete(worst); } ref.set(key, { v, f: 1, last: tick }); }
    } else { d.apply('get', key); const e = ref.get(key); if (e) { e.f++; e.last = tick; } }
    const got = [...d.val.keys()].sort().map((kk: number) => `${kk}:${d.val.get(kk)}:${d.freq.get(kk)}`).join();
    const exp = [...ref.keys()].sort().map((kk) => `${kk}:${ref.get(kk)!.v}:${ref.get(kk)!.f}`).join();
    if (got !== exp) { fail(`lfu ${got} vs ${exp}`); break; }
  }
}
// 布穀鳥／羅賓漢雜湊：內容與查詢
for (const id of ['cuckoo-hashing', 'robin-hood-hashing']) {
  for (let t = 0; t < 30; t++) {
    const d = mk(id); const init = id === 'cuckoo-hashing' ? [20, 50, 53, 75, 100, 67] : [22, 33, 1, 12, 44, 5];
    init.forEach((v) => d.apply('insert', v));
    const ref = new Set<number>(init);
    for (let k = 0; k < 50; k++) {
      const v = ri(id === 'cuckoo-hashing' ? 120 : 60);
      if (Math.random() < 0.55) { if (id === 'robin-hood-hashing' && ref.size >= 10 && !ref.has(v)) continue; d.apply('insert', v); ref.add(v); } else { d.apply('delete', v); ref.delete(v); }
      const got = id === 'cuckoo-hashing' ? d.all() : d.T.filter(Boolean).map((x: any) => x.k);
      if (sortedNum(got).join() !== sortedNum(ref).join()) { fail(`${id} contents`); break; }
      for (const x of ref) if (id === 'cuckoo-hashing' ? d.find(x) === null : d.find(x) < 0) { fail(`${id} find ${x}`); break; }
      if (id === 'robin-hood-hashing') d.T.forEach((sl: any, i: number) => { if (sl && (sl.k % d.M + sl.d) % d.M !== i) fail('robin dist'); });
    }
  }
}
// 稀疏表、分塊、二維樹狀陣列、持久化線段樹
for (let t = 0; t < 20; t++) {
  const st = mk('sparse-table'); st.apply('random');
  for (let k = 0; k < 20; k++) { const l = ri(12), r = l + ri(12 - l); const f = st.apply('min', l, r); if (!f[f.length - 1].msg.endsWith(`= ${Math.min(...st.a.slice(l, r + 1))}`)) { fail('sparse min'); break; } }
  const sq = mk('sqrt-decomposition'); const ref = [...sq.a];
  for (let k = 0; k < 30; k++) {
    if (Math.random() < 0.4) { const i = ri(16), v = ri(10); sq.apply('set', i, v); ref[i] = v; }
    const l = ri(16), r = l + ri(16 - l); const f = sq.apply('sum', l, r);
    if (!f[f.length - 1].msg.startsWith(`sum(${l}, ${r}) = ${ref.slice(l, r + 1).reduce((a: number, b: number) => a + b, 0)}`)) { fail('sqrt sum'); break; }
  }
  const fw = mk('fenwick-2d'); const A = fw.a.map((r: number[]) => [...r]);
  for (let k = 0; k < 30; k++) {
    const r = 1 + ri(6), c = 1 + ri(6), v = ri(7) - 2; fw.apply('add', `${r} ${c} ${v}`); A[r - 1][c - 1] += v;
    const r1 = 1 + ri(6), c1 = 1 + ri(6), r2 = r1 + ri(7 - r1), c2 = c1 + ri(7 - c1);
    let s = 0; for (let i = r1; i <= r2; i++) for (let j = c1; j <= c2; j++) s += A[i - 1][j - 1];
    const f = fw.apply('sum', `${r1} ${c1} ${r2} ${c2}`); if (!f[f.length - 1].msg.includes(`= ${s}（`)) { fail('fenwick2d'); break; }
  }
  const ps = mk('persistent-segment-tree');
  for (let k = 0; k < 10; k++) ps.apply('update', `${ri(8)} ${ri(10)}`);
  for (let ver = 0; ver < ps.roots.length; ver++) { const l = ri(8), r = l + ri(8 - l); const f = ps.apply('query', `${ver} ${l} ${r}`); if (!f[f.length - 1].msg.includes(`sum(${l}, ${r}) = ${ps.arrs[ver].slice(l, r + 1).reduce((a: number, b: number) => a + b, 0)}`)) { fail('persistent version'); break; } }
}
// 可回滾並查集、帶權並查集
for (let t = 0; t < 30; t++) {
  const d = mk('rollback-dsu');
  for (let k = 0; k < 4; k++) d.apply('union', ri(8), ri(8));
  const snap = [...d.p].join(); d.apply('save');
  for (let k = 0; k < 5; k++) d.apply('union', ri(8), ri(8));
  d.apply('rollback');
  if ([...d.p].join() !== snap) fail('rollback');
  const w = mk('weighted-dsu'); const val = Array.from({ length: 8 }, () => ri(20));
  for (let k = 0; k < 10; k++) { const x = ri(8), y = ri(8); w.apply('relate', `${x} ${y} ${val[x] - val[y]}`); }
  for (let k = 0; k < 10; k++) { const x = ri(8), y = ri(8); const f = w.apply('diff', `${x} ${y}`); const m = f[f.length - 1].msg.match(/= (-?\d+)$/); if (m && Number(m[1]) !== val[x] - val[y]) { fail('weighted dsu diff'); break; } }
}
// k 維樹最近鄰、四元樹範圍查詢、資料流中位數
for (let t = 0; t < 20; t++) {
  const d = mk('kd-tree'); d.apply('random');
  for (let k = 0; k < 10; k++) { const x = ri(100), y = ri(100); const f = d.apply('nearest', `${x} ${y}`); const m = f[f.length - 1].msg.match(/距離 ([\d.]+)；.*暴力法距離 ([\d.]+)/); if (!m || m[1] !== m[2]) { fail('kd nearest'); break; } }
  const q = mk('quadtree'); const pts: [number, number][] = [];
  for (let k = 0; k < 20; k++) { const p: [number, number] = [ri(64), ri(64)]; q.apply('insert', `${p[0]} ${p[1]}`); pts.push(p); }
  for (let k = 0; k < 10; k++) { const x1 = ri(50), y1 = ri(50), x2 = x1 + ri(30), y2 = y1 + ri(30); const f = q.apply('range', `${x1} ${y1} ${x2} ${y2}`); const c = pts.filter((p) => p[0] >= x1 && p[0] <= x2 && p[1] >= y1 && p[1] <= y2).length; if (!f[f.length - 1].msg.includes(`內有 ${c} 個點`)) { fail(`quadtree range ${c}: ${f[f.length - 1].msg}`); break; } }
  const sm = mk('streaming-median'); const xs: number[] = [];
  for (let k = 0; k < 20; k++) { const x = ri(80) - 20; sm.apply('add', x); xs.push(x); const s = sortedNum(xs); const m = s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; if (sm.median() !== m) { fail('stream median'); break; } }
}

console.log('invariant failures:', bad);
process.exit(bad ? 1 : 0);
