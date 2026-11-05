// 擴充的雜湊、樹與進階資料結構
import type { Color, DSDef, GEdge, GNode, Panel, PlotPanel } from '../core/types';
import { cells, rnd, table, text, vars } from '../core/helpers';
import { binaryPanel, layoutTree, type BNode } from '../core/graph';
import { isPrime, parkMiller } from '../core/extra';
import { DSBase, num } from './base';

const clampInt = (x: any, lo: number, hi: number, def = lo) => Math.max(lo, Math.min(hi, Math.floor(num(x, def))));
const nums = (a: any) => String(a ?? '').trim().split(/[\s,]+/).filter(Boolean).map(Number);

// ---------------- 布穀鳥雜湊 ----------------
class Cuckoo extends DSBase<Record<string, Color>> {
  N = 7;
  T: (number | null)[][] = [new Array(7).fill(null), new Array(7).fill(null)];
  h(t: number, x: number) { return t === 0 ? x % this.N : Math.floor(x / this.N) % this.N; }
  panels(hl: Record<string, Color> = {}): Panel[] {
    return [table(this.T.map((row) => row.map((v) => (v === null ? '' : v))), hl, { rowHeaders: [`T1：x mod ${this.N}`, `T2：⌊x/${this.N}⌋ mod ${this.N}`], colHeaders: this.T[0].map((_, i) => i), title: '兩張表，每個鍵只可能在兩個位置之一' }), vars({ 表大小: this.N, 元素數: this.all().length })];
  }
  all() { return this.T.flat().filter((v): v is number => v !== null); }
  find(x: number) { return this.T[0][this.h(0, x)] === x ? [0, this.h(0, x)] : this.T[1][this.h(1, x)] === x ? [1, this.h(1, x)] : null; }
  place(x: number, show: boolean): boolean {
    let cur = x;
    for (let i = 0; i < 2 * this.N; i++) {
      for (const t of [0, 1]) {
        const p = this.h(t, cur);
        const old = this.T[t][p];
        this.T[t][p] = cur;
        if (old === null) { if (show) this.snap(`${cur} 放進 T${t + 1}[${p}]（空位）`, 3, { [`${t},${p}`]: 'done' }); return true; }
        if (show) this.snap(`T${t + 1}[${p}] 被 ${old} 佔用：放入 ${cur}，把 ${old} 踢出去改放另一張表`, 4, { [`${t},${p}`]: 'swap' });
        cur = old;
      }
    }
    if (show) this.snap(`踢了 ${2 * this.N} 輪仍沒有空位：判定出現循環，需要換更大的表並重新雜湊（手上還有 ${cur}）`, 5, {});
    this.pending = cur;
    return false;
  }
  pending: number | null = null;
  rehash(extra: number) {
    const items = [...this.all(), extra];
    for (;;) {
      let nx = this.N + 1;
      while (!isPrime(nx)) nx++;
      this.N = nx;
      this.T = [new Array(this.N).fill(null), new Array(this.N).fill(null)];
      if (items.every((v) => this.place(v, false))) break;
    }
    this.snap(`重新雜湊到大小 ${this.N} 的新表，所有元素重新插入`, 6);
  }
  run(op: string, a?: any) {
    const x = Math.max(0, Math.floor(num(a)));
    if (op === 'insert') {
      if (this.find(x)) { this.snap(`${x} 已存在`, 1); return; }
      this.snap(`插入 ${x}：候選位置 T1[${this.h(0, x)}]、T2[${this.h(1, x)}]`, 2, { [`0,${this.h(0, x)}`]: 'compare', [`1,${this.h(1, x)}`]: 'compare' });
      if (!this.place(x, true)) this.rehash(this.pending!);
    } else if (op === 'find') {
      const f = this.find(x);
      this.snap(f ? `在 T${f[0] + 1}[${f[1]}] 找到 ${x}：最多只看兩格，最壞 O(1)` : `T1[${this.h(0, x)}] 與 T2[${this.h(1, x)}] 都不是 ${x}：不存在`, 7, f ? { [`${f[0]},${f[1]}`]: 'done' } : { [`0,${this.h(0, x)}`]: 'bad', [`1,${this.h(1, x)}`]: 'bad' });
    } else if (op === 'delete') {
      const f = this.find(x);
      if (!f) { this.snap(`${x} 不存在`, 8); return; }
      this.T[f[0]][f[1]] = null;
      this.snap(`刪除 T${f[0] + 1}[${f[1]}] 的 ${x}（直接清空，不需要墓碑）`, 8, { [`${f[0]},${f[1]}`]: 'bad' });
    }
  }
}
const cuckoo: DSDef = {
  id: 'cuckoo-hashing', name: '布穀鳥雜湊', en: 'Cuckoo Hashing', cat: 'ds-hash',
  desc: '每個鍵只可能放在兩個位置：T1[h1(x)] 或 T2[h2(x)]。插入時若位置被佔，就把原住戶「踢」到它在另一張表的位置，連鎖下去直到找到空位。查詢與刪除最壞只看兩格。踢太多次代表形成循環，必須換更大的表重新雜湊。',
  complexity: [['查詢／刪除', '最壞 O(1)'], ['插入', '期望 O(1)（均攤）'], ['負載率', '約 < 50%']],
  codes: { insert: ['若 x 已存在則結束', 'cur = x', '重複最多 MAX 次：輪流嘗試 T1[h1(cur)]、T2[h2(cur)]', '  若空位：放入，結束', '  否則與原住戶交換，cur = 被踢出的鍵', '超過 MAX 次：視為循環', '  換更大的表，所有鍵重新插入'], find: ['', '', '', '', '', '', '', 'return T1[h1(x)] == x or T2[h2(x)] == x'], delete: ['', '', '', '', '', '', '', '', '找到後直接清空該格'] },
  ops: [
    { key: 'insert', label: '插入', arg: 'number', rand: () => rnd.int(0, 99) },
    { key: 'find', label: '查詢', arg: 'number', rand: () => rnd.int(0, 99) },
    { key: 'delete', label: '刪除', arg: 'number', rand: () => rnd.int(0, 99) },
  ],
  create: () => new Cuckoo(),
  init: [['insert', 20], ['insert', 50], ['insert', 53], ['insert', 75], ['insert', 100], ['insert', 67]],
};

// ---------------- 羅賓漢雜湊 ----------------
class RobinHood extends DSBase<Record<number, Color>> {
  M = 11;
  T: ({ k: number; d: number } | null)[] = new Array(11).fill(null);
  panels(hl: Record<number, Color> = {}): Panel[] {
    const colors: Record<string, Color> = {};
    for (const [i, c] of Object.entries(hl)) { colors[`0,${i}`] = c; colors[`1,${i}`] = c; }
    return [table([this.T.map((s) => (s ? s.k : '')), this.T.map((s) => (s ? s.d : ''))], colors, { rowHeaders: ['鍵', '探測距離'], colHeaders: this.T.map((_, i) => i), title: `線性探測表（大小 ${this.M}，h(x) = x mod ${this.M}）` }), vars({ 元素數: this.T.filter(Boolean).length, 最大探測距離: Math.max(0, ...this.T.map((s) => (s ? s.d : 0))) })];
  }
  find(x: number) {
    for (let i = x % this.M, d = 0; d < this.M; i = (i + 1) % this.M, d++) {
      const s = this.T[i];
      if (!s || s.d < d) return -1;
      if (s.k === x) return i;
    }
    return -1;
  }
  run(op: string, a?: any) {
    const x = Math.max(0, Math.floor(num(a)));
    if (op === 'insert') {
      if (this.find(x) >= 0) { this.snap(`${x} 已存在`, 1); return; }
      if (this.T.every(Boolean)) { this.snap('表已滿，無法插入（實務上應在負載率過高前擴充）', 1); return; }
      let cur = { k: x, d: 0 };
      for (let i = x % this.M; ; i = (i + 1) % this.M) {
        const s = this.T[i];
        if (!s) { this.T[i] = cur; this.snap(`位置 ${i} 是空的，放入 ${cur.k}（距離 ${cur.d}）`, 3, { [i]: 'done' }); return; }
        if (s.d < cur.d) {
          this.T[i] = cur;
          this.snap(`位置 ${i} 的 ${s.k} 距離 ${s.d} 比 ${cur.k} 的 ${cur.d} 小（比較「富有」）：交換，改由 ${s.k} 繼續往後找`, 5, { [i]: 'swap' });
          cur = s;
        } else this.snap(`位置 ${i} 的 ${s.k} 距離 ${s.d} ≥ ${cur.d}，繼續往後`, 4, { [i]: 'compare' });
        cur = { k: cur.k, d: cur.d + 1 };
      }
    } else if (op === 'find') {
      for (let i = x % this.M, d = 0; d < this.M; i = (i + 1) % this.M, d++) {
        const s = this.T[i];
        if (!s) { this.snap(`位置 ${i} 是空的：${x} 不存在`, 7, { [i]: 'bad' }); return; }
        if (s.d < d) { this.snap(`位置 ${i} 的距離 ${s.d} < 目前距離 ${d}：若 ${x} 存在早該出現，提早結束`, 8, { [i]: 'bad' }); return; }
        if (s.k === x) { this.snap(`在位置 ${i} 找到 ${x}`, 7, { [i]: 'done' }); return; }
        this.snap(`位置 ${i} 是 ${s.k}，繼續`, 7, { [i]: 'compare' });
      }
    } else if (op === 'delete') {
      let i = this.find(x);
      if (i < 0) { this.snap(`${x} 不存在`, 9); return; }
      this.T[i] = null;
      this.snap(`刪除位置 ${i} 的 ${x}`, 9, { [i]: 'bad' });
      for (let j = (i + 1) % this.M; this.T[j] && this.T[j]!.d > 0; i = j, j = (j + 1) % this.M) {
        this.T[i] = { k: this.T[j]!.k, d: this.T[j]!.d - 1 };
        this.T[j] = null;
        this.snap(`後移刪除：${this.T[i]!.k} 往前移一格（距離 −1），探測鏈不會斷`, 10, { [i]: 'swap' });
      }
    }
  }
}
const robinHood: DSDef = {
  id: 'robin-hood-hashing', name: '羅賓漢雜湊', en: 'Robin Hood Hashing', cat: 'ds-hash',
  desc: '線性探測的改良：每個元素記錄離「理想位置」的探測距離。插入時若遇到距離比自己小的元素（比較富有），就搶走它的位置，讓它繼續往後找——劫富濟貧，使各元素的探測距離更平均。查詢時一旦看到距離比目前小的元素就能提早結束；刪除採「後移」而非墓碑，保持探測鏈完整。',
  complexity: [['查詢／插入／刪除', '期望 O(1)'], ['最大探測距離', '期望 O(log n)']],
  codes: { insert: ['若已存在則結束', 'i = h(x)，d = 0', '從 i 往後掃：', '  空位：放入 (x, d)', '  slot.d >= d：繼續（i += 1，d += 1）', '  slot.d < d：交換，改帶著被換出的元素繼續'], find: ['', '', '', '', '', '', '', '從 h(x) 往後：空位 → 不存在；找到 → 回傳', '  slot.d < 目前距離 → 提早判定不存在'], delete: ['', '', '', '', '', '', '', '', '', '找到並清空', '後面距離 > 0 的元素逐一往前移、距離 −1'] },
  ops: [
    { key: 'insert', label: '插入', arg: 'number', rand: () => rnd.int(0, 60) },
    { key: 'find', label: '查詢', arg: 'number', rand: () => rnd.int(0, 60) },
    { key: 'delete', label: '刪除', arg: 'number', rand: () => rnd.int(0, 60) },
  ],
  create: () => new RobinHood(),
  init: [['insert', 22], ['insert', 33], ['insert', 1], ['insert', 12], ['insert', 44], ['insert', 5]],
};

// ---------------- 樹堆 ----------------
interface TNode extends BNode { pri: number; left: TNode | null; right: TNode | null }
class Treap extends DSBase<Record<number, Color>> {
  root: TNode | null = null;
  rng = parkMiller(2024);
  ids = 0;
  panels(c: Record<number, Color> = {}): Panel[] {
    return [binaryPanel(this.root, { color: (n) => c[n.val as number], sub: (n) => `p=${(n as TNode).pri}`, title: '樹堆：鍵值符合 BST 順序，優先權（下方 p）符合最大堆積' })];
  }
  rotR(n: TNode) { const l = n.left!; n.left = l.right; l.right = n; return l; }
  rotL(n: TNode) { const r = n.right!; n.right = r.left; r.left = n; return r; }
  insert(n: TNode | null, k: number): TNode {
    if (!n) { const nn: TNode = { id: this.ids++, val: k, pri: this.rng.int(100), left: null, right: null }; this.snap(`建立節點 ${k}，隨機優先權 ${nn.pri}`, 1); return nn; }
    if (k === n.val) return n;
    if (k < (n.val as number)) {
      n.left = this.insert(n.left, k);
      if (n.left.pri > n.pri) { this.snap(`${n.left.val} 的優先權 ${n.left.pri} > 父節點 ${n.val} 的 ${n.pri}：右旋`, 3, { [n.left.val as number]: 'swap', [n.val as number]: 'compare' }); n = this.rotR(n); }
    } else {
      n.right = this.insert(n.right, k);
      if (n.right.pri > n.pri) { this.snap(`${n.right.val} 的優先權 ${n.right.pri} > 父節點 ${n.val} 的 ${n.pri}：左旋`, 3, { [n.right.val as number]: 'swap', [n.val as number]: 'compare' }); n = this.rotL(n); }
    }
    return n;
  }
  remove(n: TNode | null, k: number): TNode | null {
    if (!n) return null;
    if (k < (n.val as number)) n.left = this.remove(n.left, k);
    else if (k > (n.val as number)) n.right = this.remove(n.right, k);
    else {
      if (!n.left || !n.right) { this.snap(`${k} 最多一個子節點，直接移除`, 6, { [k]: 'bad' }); return n.left ?? n.right; }
      if (n.left.pri > n.right.pri) { this.snap(`把 ${k} 往下轉：優先權較高的左子 ${n.left.val} 上來（右旋）`, 5, { [k]: 'bad', [n.left.val as number]: 'swap' }); n = this.rotR(n); n.right = this.remove(n.right, k); }
      else { this.snap(`把 ${k} 往下轉：優先權較高的右子 ${n.right.val} 上來（左旋）`, 5, { [k]: 'bad', [n.right.val as number]: 'swap' }); n = this.rotL(n); n.left = this.remove(n.left, k); }
    }
    return n;
  }
  has(k: number) { let n = this.root; while (n && n.val !== k) n = k < (n.val as number) ? n.left : n.right; return !!n; }
  run(op: string, a?: any) {
    const k = Math.floor(num(a));
    if (op === 'insert') {
      if (this.has(k)) { this.snap(`${k} 已存在`); return; }
      this.root = this.insert(this.root, k);
      this.snap(`插入 ${k} 完成：BST 順序與堆積順序都成立`, 4, { [k]: 'done' });
    } else if (op === 'delete') {
      if (!this.has(k)) { this.snap(`${k} 不存在`); return; }
      this.root = this.remove(this.root, k);
      this.snap(`刪除 ${k} 完成`, 6);
    } else if (op === 'find') {
      const path: number[] = [];
      let n = this.root;
      while (n) { path.push(n.val as number); if (n.val === k) break; n = k < (n.val as number) ? n.left : n.right; }
      this.snap(n ? `找到 ${k}（走了 ${path.length} 步；期望深度 O(log n)）` : `${k} 不存在`, 7, Object.fromEntries(path.map((v) => [v, v === k ? 'done' : 'compare'])));
    }
  }
}
const treap: DSDef = {
  id: 'treap', name: '樹堆', en: 'Treap', cat: 'ds-tree',
  desc: '每個節點有鍵值與隨機優先權：鍵值滿足二元搜尋樹順序，優先權滿足最大堆積。插入時先照 BST 放到葉子，再用旋轉把優先權高的往上提；刪除時把節點旋轉到葉子再移除。隨機優先權讓樹的期望深度為 O(log n)。本頁使用固定種子，重新整理後結果可重現。',
  complexity: [['插入／刪除／查詢', '期望 O(log n)'], ['空間', 'O(n)']],
  codes: { insert: ['依 BST 規則插到葉子，給隨機優先權', '回溯時：', '  若子節點優先權 > 自己：旋轉讓子節點上來', '完成'], delete: ['', '', '', '', '找到節點：', '  把優先權較高的子節點旋上來，節點往下沉', '  成為葉子或只剩一個子節點時移除'], find: ['', '', '', '', '', '', '', '與 BST 相同的搜尋'] },
  ops: [
    { key: 'insert', label: '插入', arg: 'number', rand: () => rnd.int(1, 60) },
    { key: 'delete', label: '刪除', arg: 'number', rand: () => rnd.int(1, 60) },
    { key: 'find', label: '查詢', arg: 'number', rand: () => rnd.int(1, 60) },
  ],
  create: () => new Treap(),
  init: [['insert', 30], ['insert', 15], ['insert', 45], ['insert', 8], ['insert', 22], ['insert', 37], ['insert', 52]],
};

// ---------------- 順序統計樹（AVL + 子樹大小） ----------------
interface ONode extends BNode { h: number; size: number; left: ONode | null; right: ONode | null }
class OST extends DSBase<Record<number, Color>> {
  root: ONode | null = null;
  ids = 0;
  H = (n: ONode | null) => (n ? n.h : 0);
  S = (n: ONode | null) => (n ? n.size : 0);
  fix(n: ONode) { n.h = 1 + Math.max(this.H(n.left), this.H(n.right)); n.size = 1 + this.S(n.left) + this.S(n.right); }
  rotR(n: ONode) { const l = n.left!; n.left = l.right; l.right = n; this.fix(n); this.fix(l); return l; }
  rotL(n: ONode) { const r = n.right!; n.right = r.left; r.left = n; this.fix(n); this.fix(r); return r; }
  balance(n: ONode): ONode {
    this.fix(n);
    const bf = this.H(n.left) - this.H(n.right);
    if (bf > 1) { if (this.H(n.left!.left) < this.H(n.left!.right)) n.left = this.rotL(n.left!); this.snap(`節點 ${n.val} 左邊過高：旋轉並重算子樹大小`, 3, { [n.val as number]: 'swap' }); return this.rotR(n); }
    if (bf < -1) { if (this.H(n.right!.right) < this.H(n.right!.left)) n.right = this.rotR(n.right!); this.snap(`節點 ${n.val} 右邊過高：旋轉並重算子樹大小`, 3, { [n.val as number]: 'swap' }); return this.rotL(n); }
    return n;
  }
  ins(n: ONode | null, k: number): ONode {
    if (!n) return { id: this.ids++, val: k, h: 1, size: 1, left: null, right: null };
    if (k < (n.val as number)) n.left = this.ins(n.left, k); else n.right = this.ins(n.right, k);
    return this.balance(n);
  }
  del(n: ONode | null, k: number): ONode | null {
    if (!n) return null;
    if (k < (n.val as number)) n.left = this.del(n.left, k);
    else if (k > (n.val as number)) n.right = this.del(n.right, k);
    else {
      if (!n.left || !n.right) return n.left ?? n.right;
      let m = n.right;
      while (m.left) m = m.left;
      n.val = m.val;
      n.right = this.del(n.right, m.val as number);
    }
    return this.balance(n);
  }
  has(k: number) { let n = this.root; while (n && n.val !== k) n = k < (n.val as number) ? n.left : n.right; return !!n; }
  panels(c: Record<number, Color> = {}): Panel[] {
    return [binaryPanel(this.root, { color: (n) => c[n.val as number], sub: (n) => `size ${(n as ONode).size}`, title: 'AVL 樹，每個節點額外記錄子樹大小 size' }), vars({ 節點數: this.S(this.root) })];
  }
  run(op: string, a?: any) {
    const k = Math.floor(num(a));
    if (op === 'insert') {
      if (this.has(k)) { this.snap(`${k} 已存在（本頁不存重複鍵）`); return; }
      this.root = this.ins(this.root, k);
      this.snap(`插入 ${k}：沿路徑的 size 都 +1，旋轉後重新計算`, 2, { [k]: 'done' });
    } else if (op === 'delete') {
      if (!this.has(k)) { this.snap(`${k} 不存在`); return; }
      this.root = this.del(this.root, k);
      this.snap(`刪除 ${k}：沿路徑的 size 都 −1`, 2);
    } else if (op === 'select') {
      const total = this.S(this.root);
      if (k < 1 || k > total) { this.snap(`k 必須介於 1 與 ${total}`); return; }
      let n = this.root, kk = k;
      const path: Record<number, Color> = {};
      while (n) {
        const ls = this.S(n.left);
        if (kk === ls + 1) { path[n.val as number] = 'done'; this.snap(`左子樹有 ${ls} 個，k = ${kk} = ${ls} + 1：答案就是 ${n.val}`, 6, path); return; }
        path[n.val as number] = 'compare';
        if (kk <= ls) { this.snap(`左子樹有 ${ls} 個 ≥ k = ${kk}：往左`, 5, { ...path }); n = n.left; }
        else { this.snap(`左子樹有 ${ls} 個，k = ${kk} > ${ls} + 1：往右找第 ${kk - ls - 1} 小`, 7, { ...path }); kk -= ls + 1; n = n.right; }
      }
    } else if (op === 'rank') {
      let n = this.root, r = 0;
      const path: Record<number, Color> = {};
      while (n) {
        path[n.val as number] = 'compare';
        if (k <= (n.val as number)) { this.snap(`${k} ≤ ${n.val}：往左`, 9, { ...path }); n = n.left; }
        else { r += this.S(n.left) + 1; this.snap(`${k} > ${n.val}：${n.val} 與它的左子樹（${this.S(n.left)} 個）都比 ${k} 小，累計 ${r}`, 10, { ...path }); n = n.right; }
      }
      this.snap(`比 ${k} 小的鍵有 ${r} 個，rank(${k}) = ${r + 1}`, 10, path);
    }
  }
}
const ost: DSDef = {
  id: 'order-statistic-tree', name: '順序統計樹', en: 'Order Statistic Tree', cat: 'ds-tree',
  desc: '在平衡二元搜尋樹（這裡是 AVL）的每個節點多記錄子樹大小 size，就能在 O(log n) 內回答「第 k 小的元素」（select）與「x 是第幾小」（rank）。插入、刪除與旋轉時都要沿路徑重新計算 size。',
  complexity: [['插入／刪除', 'O(log n)'], ['select / rank', 'O(log n)'], ['空間', 'O(n)']],
  codes: { insert: ['依 BST 規則插入', '回溯時更新 h 與 size = 1 + size(左) + size(右)', '  失衡就旋轉，旋轉後重算受影響節點的 size'], delete: ['依 BST 規則刪除（兩個子節點時用後繼取代）', '回溯時更新 size 並平衡'], select: ['select(k)：', '', '', '', '  ls = size(左)；k <= ls：往左', '  k == ls + 1：就是目前節點', '  否則：k −= ls + 1，往右'], rank: ['', '', '', '', '', '', '', '', 'rank(x)：r = 0', '  x <= 節點：往左', '  x > 節點：r += size(左) + 1，往右；最後回傳 r + 1'] },
  ops: [
    { key: 'insert', label: '插入', arg: 'number', rand: () => rnd.int(1, 60) },
    { key: 'delete', label: '刪除', arg: 'number', rand: () => rnd.int(1, 60) },
    { key: 'select', label: '第 k 小', arg: 'number', argLabel: 'k', rand: () => rnd.int(1, 6) },
    { key: 'rank', label: 'rank(x)', arg: 'number', argLabel: 'x', rand: () => rnd.int(1, 60) },
  ],
  create: () => new OST(),
  init: [['insert', 20], ['insert', 10], ['insert', 30], ['insert', 5], ['insert', 15], ['insert', 25], ['insert', 40], ['insert', 12]],
};

// ---------------- 二進位字典樹 ----------------
class BinaryTrie extends DSBase<{ path?: string[]; color?: Color }> {
  W = 5;
  cnt = new Map<string, number>([['', 0]]); // 前綴 → 經過的數字個數
  panels(h: { path?: string[]; color?: Color } = {}): Panel[] {
    const kids: Record<string, string[]> = {};
    const prefixes = [...this.cnt.keys()].filter((p) => this.cnt.get(p)! > 0 || p === '');
    for (const p of prefixes) kids['p' + p] = ['0', '1'].filter((b) => (this.cnt.get(p + b) ?? 0) > 0).map((b) => 'p' + p + b);
    const pos = layoutTree('p', kids, 34, 56);
    const nodes: GNode[] = prefixes.map((p) => ({ id: 'p' + p, x: pos['p' + p].x, y: pos['p' + p].y, label: p === '' ? 'root' : p[p.length - 1], r: 14, color: h.path?.includes(p) ? h.color ?? 'active' : p.length === this.W ? 'done' : undefined, sub: p.length === this.W ? String(parseInt(p, 2)) : undefined, badge: p === '' ? undefined : `×${this.cnt.get(p)}` }));
    const edges: GEdge[] = prefixes.flatMap((p) => kids['p' + p].map((c) => ({ from: 'p' + p, to: c, color: h.path?.includes(c.slice(1)) ? (h.color ?? 'active') : undefined })));
    return [{ type: 'graph', nodes, edges, title: `由高位到低位（${this.W} 位元）；葉子下方是數值，上方 ×n 為經過次數`, height: 380 }];
  }
  bits(x: number) { return x.toString(2).padStart(this.W, '0'); }
  run(op: string, a?: any) {
    const x = clampInt(a, 0, 2 ** this.W - 1);
    const b = this.bits(x);
    if (op === 'insert') {
      for (let i = 0; i <= this.W; i++) this.cnt.set(b.slice(0, i), (this.cnt.get(b.slice(0, i)) ?? 0) + 1);
      this.snap(`插入 ${x} = ${b}₂：沿位元路徑走下去，沿途計數 +1`, 1, { path: Array.from({ length: this.W + 1 }, (_, i) => b.slice(0, i)), color: 'swap' });
    } else if (op === 'delete') {
      if (!(this.cnt.get(b) ?? 0)) { this.snap(`${x} 不在字典樹中`, 2); return; }
      for (let i = 0; i <= this.W; i++) this.cnt.set(b.slice(0, i), this.cnt.get(b.slice(0, i))! - 1);
      this.snap(`刪除 ${x}：沿路徑計數 −1，計數為 0 的節點消失`, 2, { path: [b], color: 'bad' });
    } else if (op === 'maxxor') {
      if (!this.cnt.get('')) { this.snap('字典樹是空的'); return; }
      let p = '';
      const path = [''];
      for (let i = 0; i < this.W; i++) {
        const want = b[i] === '0' ? '1' : '0';
        const go = (this.cnt.get(p + want) ?? 0) > 0 ? want : b[i];
        this.snap(`第 ${this.W - 1 - i} 位：x 是 ${b[i]}，想走相反的 ${want}${go === want ? '，存在 → 這一位 XOR 為 1' : '，不存在只好走 ' + go}`, 3, { path: [...path, p + go] });
        p += go;
        path.push(p);
      }
      const y = parseInt(p, 2);
      this.snap(`與 ${x} XOR 最大的是 ${y}：${x} ⊕ ${y} = ${x ^ y}（貪婪地讓高位先變 1）`, 4, { path, color: 'done' });
    }
  }
}
const binaryTrie: DSDef = {
  id: 'binary-trie', name: '二進位字典樹', en: 'Binary Trie', cat: 'ds-tree',
  desc: '把固定字寬（這裡 5 位元，0–31）的非負整數由最高位到最低位插入字典樹，每個節點記錄經過的數字個數以支援重複與刪除。查詢「與 x XOR 最大的數」時，每一位都盡量走與 x 相反的分支，讓高位先變成 1。負數需先約定二補數表示法，本頁只接受非負整數。',
  complexity: [['插入／刪除', 'O(W)'], ['最大 XOR 查詢', 'O(W)'], ['空間', 'O(n·W)']],
  codes: { insert: ['for bit in x 的 W 位（高 → 低）：往下走並計數 +1'], delete: ['', '', '沿路徑計數 −1'], maxxor: ['', '', '', 'for 每一位：若相反的分支存在就走過去，否則走相同分支', 'XOR 結果的高位盡可能是 1'] },
  ops: [
    { key: 'insert', label: '插入', arg: 'number', argLabel: '0–31', rand: () => rnd.int(0, 31) },
    { key: 'delete', label: '刪除', arg: 'number', argLabel: '0–31', rand: () => rnd.int(0, 31) },
    { key: 'maxxor', label: '最大 XOR', arg: 'number', argLabel: 'x', rand: () => rnd.int(0, 31) },
  ],
  create: () => new BinaryTrie(),
  init: [['insert', 3], ['insert', 10], ['insert', 5], ['insert', 25], ['insert', 2], ['insert', 8]],
};

// ---------------- 壓縮字典樹 ----------------
interface RNode { id: number; end: boolean; kids: Map<string, { label: string; to: RNode }> }
class RadixTree extends DSBase<{ hl?: number[]; c?: Color }> {
  ids = 0;
  root: RNode = this.mk();
  mk(): RNode { return { id: this.ids++, end: false, kids: new Map() }; }
  panels(h: { hl?: number[]; c?: Color } = {}): Panel[] {
    const kids: Record<string, string[]> = {};
    const all: RNode[] = [];
    const edges: GEdge[] = [];
    const walk = (n: RNode) => { all.push(n); kids['r' + n.id] = [...n.kids.keys()].sort().map((k) => 'r' + n.kids.get(k)!.to.id); for (const k of [...n.kids.keys()].sort()) { const e = n.kids.get(k)!; edges.push({ from: 'r' + n.id, to: 'r' + e.to.id, label: e.label, color: h.hl?.includes(e.to.id) ? h.c ?? 'active' : undefined }); walk(e.to); } };
    walk(this.root);
    const pos = layoutTree('r' + this.root.id, kids, 70, 70);
    const nodes: GNode[] = all.map((n) => ({ id: 'r' + n.id, x: pos['r' + n.id].x, y: pos['r' + n.id].y, label: n === this.root ? '·' : n.end ? '●' : '', r: 11, color: h.hl?.includes(n.id) ? h.c ?? 'active' : n.end ? 'done' : undefined }));
    return [{ type: 'graph', nodes, edges, title: '壓縮字典樹：邊上是字串片段，綠色節點代表一個完整單字的結尾', height: 380 }, text([this.words().join(', ') || '（空）'], '目前的單字')];
  }
  words() { const out: string[] = []; const go = (n: RNode, s: string) => { if (n.end) out.push(s); for (const e of n.kids.values()) go(e.to, s + e.label); }; go(this.root, ''); return out.sort(); }
  run(op: string, a?: any) {
    const w = String(a ?? '').trim().toLowerCase();
    if (!/^[a-z]+$/.test(w)) { this.snap('請輸入英文字母組成的單字'); return; }
    let n = this.root, i = 0;
    const path = [n.id];
    while (i < w.length) {
      const e = n.kids.get(w[i]);
      if (!e) {
        if (op === 'insert') { const leaf = this.mk(); leaf.end = true; n.kids.set(w[i], { label: w.slice(i), to: leaf }); this.snap(`沒有以「${w[i]}」開頭的邊：新增邊「${w.slice(i)}」`, 3, { hl: [...path, leaf.id], c: 'swap' }); return; }
        this.snap(`找不到以「${w[i]}」開頭的邊：${op === 'prefix' ? `沒有以「${w}」為前綴的單字` : `「${w}」不存在`}`, op === 'prefix' ? 8 : 6, { hl: path, c: 'bad' });
        return;
      }
      let k = 0;
      while (k < e.label.length && i + k < w.length && e.label[k] === w[i + k]) k++;
      if (k === e.label.length) { i += k; n = e.to; path.push(n.id); this.snap(`整條邊「${e.label}」都相符，往下走`, 2, { hl: [...path] }); continue; }
      if (i + k === w.length && op === 'prefix') {
        let c = 0; const go = (x: RNode) => { if (x.end) c++; x.kids.forEach((ee) => go(ee.to)); }; go(e.to);
        this.snap(`前綴「${w}」停在邊「${e.label}」的中間（第 ${k} 個字元後）：底下共有 ${c} 個單字`, 8, { hl: [...path, e.to.id], c: 'done' });
        return;
      }
      if (op !== 'insert') { this.snap(`邊「${e.label}」只有前 ${k} 個字元相符：「${w}」不存在`, 6, { hl: path, c: 'bad' }); return; }
      const mid = this.mk();
      mid.kids.set(e.label[k], { label: e.label.slice(k), to: e.to });
      n.kids.set(w[i], { label: e.label.slice(0, k), to: mid });
      this.snap(`邊「${e.label}」只共享前 ${k} 個字元：分裂成「${e.label.slice(0, k)}」+「${e.label.slice(k)}」`, 4, { hl: [...path, mid.id], c: 'swap' });
      i += k; n = mid; path.push(mid.id);
      if (i === w.length) { mid.end = true; this.snap(`分裂點正好是「${w}」的結尾，標記為單字`, 5, { hl: path, c: 'done' }); return; }
    }
    if (op === 'insert') { const was = n.end; n.end = true; this.snap(was ? `「${w}」已存在` : `「${w}」的路徑已存在，標記結尾`, 5, { hl: path, c: 'done' }); }
    else if (op === 'search') this.snap(n.end ? `找到單字「${w}」` : `路徑存在但沒有標記結尾：「${w}」只是其他單字的前綴`, 6, { hl: path, c: n.end ? 'done' : 'bad' });
    else { let c = 0; const go = (x: RNode) => { if (x.end) c++; x.kids.forEach((ee) => go(ee.to)); }; go(n); this.snap(`以「${w}」為前綴的單字有 ${c} 個`, 8, { hl: path, c: 'done' }); }
  }
}
const radixTree: DSDef = {
  id: 'radix-tree', name: '壓縮字典樹', en: 'Radix Tree (Compressed Trie)', cat: 'ds-tree',
  desc: '把字典樹中只有一個子節點的鏈壓縮成一條邊，邊上存字串片段，節點數最多 2n。插入時若新單字只和某條邊共享一部分，就要把邊分裂；查詢前綴時，前綴可能停在一條邊的中間，那條邊底下的所有單字都符合。',
  complexity: [['插入／查詢', 'O(L)（L 為字串長度）'], ['節點數', '≤ 2n']],
  codes: { insert: ['從根開始，找以下一個字元開頭的邊', '  整條邊相符：往下走', '  沒有這條邊：新增一條邊存剩下的字串', '  只共享一部分：在共享處分裂邊，再接上剩下的部分', '  單字結束於節點：標記結尾'], search: ['', '', '', '', '', '路徑完整走完且節點有結尾標記才算找到'], prefix: ['', '', '', '', '', '', '', '前綴可停在邊的中間：統計該處底下的單字數'] },
  ops: [
    { key: 'insert', label: '插入', arg: 'text', argLabel: '單字', rand: () => rnd.pick(['romane', 'romanus', 'romulus', 'rubens', 'ruber', 'rubicon', 'rubicundus', 'rom', 'rub']) },
    { key: 'search', label: '查詢單字', arg: 'text', argLabel: '單字', rand: () => rnd.pick(['romane', 'rom', 'rub', 'ruber', 'rubicon']) },
    { key: 'prefix', label: '前綴計數', arg: 'text', argLabel: '前綴', rand: () => rnd.pick(['r', 'ro', 'rom', 'rub', 'rubi', 'x']) },
  ],
  create: () => new RadixTree(),
  init: [['insert', 'romane'], ['insert', 'romanus'], ['insert', 'romulus'], ['insert', 'rubens'], ['insert', 'ruber'], ['insert', 'rubicon']],
};

// ---------------- 稀疏表 ----------------
class SparseTable extends DSBase<Record<string, Color>> {
  a = [5, 2, 8, 6, 3, 7, 1, 9, 4, 6, 2, 8];
  st: number[][] = [];
  constructor() { super(); this.build(); }
  build() {
    const n = this.a.length;
    this.st = [this.a.slice()];
    for (let j = 1; 1 << j <= n; j++) this.st.push(Array.from({ length: n - (1 << j) + 1 }, (_, i) => Math.min(this.st[j - 1][i], this.st[j - 1][i + (1 << (j - 1))])));
  }
  panels(h: Record<string, Color> = {}): Panel[] {
    const n = this.a.length;
    return [cells(this.a, Object.fromEntries(Object.entries(h).filter(([k]) => k.startsWith('a')).map(([k, v]) => [k.slice(1), v])), { title: '陣列 a' }), table(this.st.map((row) => Array.from({ length: n }, (_, i) => row[i] ?? '')), Object.fromEntries(Object.entries(h).filter(([k]) => !k.startsWith('a'))), { rowHeaders: this.st.map((_, j) => `2^${j}`), colHeaders: this.a.map((_, i) => i), title: 'st[j][i] = min(a[i .. i + 2^j − 1])' })];
  }
  run(op: string, a?: any, b?: any) {
    const n = this.a.length;
    if (op === 'random') { this.a = rnd.arr(12, 1, 20); this.build(); for (let j = 1; j < this.st.length; j++) this.snap(`建第 ${j} 列：每格取上一列兩個長度 2^${j - 1} 區段的最小值`, 2, Object.fromEntries(this.st[j].map((_, i) => [`${j},${i}`, 'swap' as Color]))); return; }
    let l = clampInt(a, 0, n - 1), r = clampInt(b, 0, n - 1, n - 1);
    if (l > r) [l, r] = [r, l];
    const k = Math.floor(Math.log2(r - l + 1));
    const x = this.st[k][l], y = this.st[k][r - (1 << k) + 1];
    const hl: Record<string, Color> = { [`${k},${l}`]: 'compare', [`${k},${r - (1 << k) + 1}`]: 'compare' };
    for (let i = l; i <= r; i++) hl['a' + i] = i < l + (1 << k) && i > r - (1 << k) ? 'special' : i < l + (1 << k) ? 'frontier' : 'visited';
    if (op === 'min') this.snap(`區間 [${l}, ${r}] 長度 ${r - l + 1}，k = ⌊log₂⌋ = ${k}：兩段長度 ${1 << k} 的區間 [${l}, ${l + (1 << k) - 1}] 與 [${r - (1 << k) + 1}, ${r}] 互相重疊也沒關係，min = min(${x}, ${y}) = ${Math.min(x, y)}`, 4, hl);
    else {
      const real = this.a.slice(l, r + 1).reduce((s, v) => s + v, 0);
      let wrong = 0;
      for (let i = l; i < l + (1 << k); i++) wrong += this.a[i];
      for (let i = r - (1 << k) + 1; i <= r; i++) wrong += this.a[i];
      this.snap(`錯誤示範：若照搬到「區間和」，重疊部分（粉紅）會被加兩次，得到 ${wrong} ≠ 正確的 ${real}。O(1) 重疊查詢只適用於 min、max、gcd 這類冪等運算`, 5, hl);
    }
  }
}
const sparseTable: DSDef = {
  id: 'sparse-table', name: '稀疏表', en: 'Sparse Table', cat: 'ds-adv',
  desc: '預先計算每個起點 i、長度 2^j 的區間最小值 st[j][i] = min(st[j−1][i], st[j−1][i + 2^(j−1)])。查詢 [l, r] 時取 k = ⌊log₂(r − l + 1)⌋，用兩段長度 2^k 的區間覆蓋（允許重疊），O(1) 得到答案。只適用於靜態陣列與 min／max／gcd 等冪等運算；區間和不能這樣重疊。',
  complexity: [['預處理', 'O(n log n)'], ['查詢（冪等運算）', 'O(1)'], ['空間', 'O(n log n)']],
  codes: { random: ['st[0] = a', 'for j = 1 .. log n:', '  st[j][i] = min(st[j−1][i], st[j−1][i + 2^(j−1)])'], min: ['', '', '', 'query(l, r)：k = floor(log2(r − l + 1))', '  return min(st[k][l], st[k][r − 2^k + 1])'], sum: ['', '', '', '', '', '區間和不是冪等：重疊部分會被重複計算'] },
  ops: [
    { key: 'min', label: '區間最小值(l, r)', arg: 'two', argLabel: 'l r', rand: () => { const l = rnd.int(0, 9); return [l, rnd.int(l, 11)]; } },
    { key: 'sum', label: '照搬求和（錯誤示範）', arg: 'two', argLabel: 'l r', rand: () => { const l = rnd.int(0, 6); return [l, rnd.int(l + 2, 11)]; } },
    { key: 'random', label: '隨機陣列並重建', arg: 'none' },
  ],
  create: () => new SparseTable(),
};

// ---------------- 平方根分塊 ----------------
class SqrtDecomp extends DSBase<Record<number, Color>> {
  a = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3];
  B = 4;
  sums: number[] = [];
  constructor() { super(); this.rebuild(); }
  rebuild() { this.sums = Array.from({ length: Math.ceil(this.a.length / this.B) }, (_, b) => this.a.slice(b * this.B, (b + 1) * this.B).reduce((s, v) => s + v, 0)); }
  panels(h: Record<number, Color> = {}): Panel[] {
    const blockColor: Color[] = ['frontier', 'visited'];
    return [cells(this.a, Object.fromEntries(this.a.map((_, i) => [i, h[i] ?? undefined])), { title: `陣列（每 ${this.B} 個一塊）`, headers: this.a.map((_, i) => `${i}${i % this.B === 0 ? '|' : ''}`) }), cells(this.sums, Object.fromEntries(this.sums.map((_, b) => [b, h[-(b + 1)] ?? blockColor[b % 2]])), { title: '每塊的總和', headers: this.sums.map((_, b) => `塊 ${b}`) })];
  }
  run(op: string, a?: any, b?: any) {
    const n = this.a.length;
    if (op === 'set') {
      const i = clampInt(a, 0, n - 1), v = Math.floor(num(b, 0));
      const blk = Math.floor(i / this.B);
      this.sums[blk] += v - this.a[i];
      this.a[i] = v;
      this.snap(`a[${i}] = ${v}，同時更新所屬塊 ${blk} 的總和為 ${this.sums[blk]}`, 4, { [i]: 'swap', [-(blk + 1)]: 'swap' });
      return;
    }
    let l = clampInt(a, 0, n - 1), r = clampInt(b, 0, n - 1, n - 1);
    if (l > r) [l, r] = [r, l];
    let s = 0;
    const hl: Record<number, Color> = {};
    let i = l;
    while (i <= r) {
      if (i % this.B === 0 && i + this.B - 1 <= r) { const blk = i / this.B; s += this.sums[blk]; hl[-(blk + 1)] = 'done'; for (let k = i; k < i + this.B; k++) hl[k] = 'path'; this.snap(`塊 ${blk} 完整落在區間內：直接加上塊總和 ${this.sums[blk]}，累計 ${s}`, 2, { ...hl }); i += this.B; }
      else { s += this.a[i]; hl[i] = 'compare'; this.snap(`邊界零散元素 a[${i}] = ${this.a[i]}，累計 ${s}`, 1, { ...hl }); i++; }
    }
    const brute = this.a.slice(l, r + 1).reduce((x, y) => x + y, 0);
    this.snap(`sum(${l}, ${r}) = ${s}（逐一相加 ${brute}）`, 3, hl);
  }
}
const sqrtDecomp: DSDef = {
  id: 'sqrt-decomposition', name: '平方根分塊', en: 'Square Root Decomposition', cat: 'ds-adv',
  desc: '把陣列切成大小約 √n 的塊並預存每塊的總和。區間查詢時，完整落在區間內的塊直接用塊總和，只有兩端零散的元素逐一相加，共 O(√n)；單點更新只需修改元素與所屬塊的總和。概念簡單，是莫隊演算法等技巧的基礎。',
  complexity: [['區間查詢', 'O(√n)'], ['單點更新', 'O(1)'], ['空間', 'O(√n) 額外']],
  codes: { sum: ['兩端不完整的塊：逐一加上元素', '中間完整的塊：直接加塊總和', 'return 總和'], set: ['', '', '', 'set(i, v)：sums[i / B] += v − a[i]；a[i] = v'] },
  ops: [
    { key: 'sum', label: '區間和(l, r)', arg: 'two', argLabel: 'l r', rand: () => { const l = rnd.int(0, 10); return [l, rnd.int(l, 15)]; } },
    { key: 'set', label: '單點設值(i, v)', arg: 'two', argLabel: 'i v', rand: () => [rnd.int(0, 15), rnd.int(0, 9)] },
  ],
  create: () => new SqrtDecomp(),
};

// ---------------- 持久化線段樹 ----------------
interface PNode { id: number; sum: number; l: number; r: number; L: number; R: number }
class PersistentSeg extends DSBase<{ ver?: number; hl?: Record<number, Color> }> {
  n = 8;
  nodes: PNode[] = [];
  roots: number[] = [];
  arrs: number[][] = [];
  constructor() {
    super();
    const a = [4, 1, 3, 5, 2, 6, 1, 3];
    this.roots.push(this.build(a, 0, this.n - 1));
    this.arrs.push(a);
  }
  mk(sum: number, l: number, r: number, L = -1, R = -1) { this.nodes.push({ id: this.nodes.length, sum, l, r, L, R }); return this.nodes.length - 1; }
  build(a: number[], l: number, r: number): number {
    if (l === r) return this.mk(a[l], l, r);
    const m = (l + r) >> 1;
    const L = this.build(a, l, m), R = this.build(a, m + 1, r);
    return this.mk(this.nodes[L].sum + this.nodes[R].sum, l, r, L, R);
  }
  panels(h: { ver?: number; hl?: Record<number, Color> } = {}): Panel[] {
    const ver = h.ver ?? this.roots.length - 1;
    const kids: Record<string, string[]> = {};
    const seen: PNode[] = [];
    const walk = (id: number) => { const nd = this.nodes[id]; seen.push(nd); kids['p' + id] = nd.L >= 0 ? ['p' + nd.L, 'p' + nd.R] : []; if (nd.L >= 0) { walk(nd.L); walk(nd.R); } };
    walk(this.roots[ver]);
    const pos = layoutTree('p' + this.roots[ver], kids, 54, 62);
    const nodes: GNode[] = seen.map((nd) => ({ id: 'p' + nd.id, x: pos['p' + nd.id].x, y: pos['p' + nd.id].y, label: String(nd.sum), shape: 'rect', w: 44, h: 28, color: h.hl?.[nd.id], badge: `#${nd.id} [${nd.l},${nd.r}]` }));
    const edges: GEdge[] = seen.filter((nd) => nd.L >= 0).flatMap((nd) => [{ from: 'p' + nd.id, to: 'p' + nd.L }, { from: 'p' + nd.id, to: 'p' + nd.R }]);
    return [{ type: 'graph', nodes, edges, title: `版本 ${ver} 的樹（#編號相同的節點在不同版本間共用）`, height: 360 }, cells(this.arrs[ver], {}, { title: `版本 ${ver} 的陣列` }), table(this.roots.map((rt, v) => [v, `#${rt}`, this.arrs[v].join(' ')]), { [`${ver},0`]: 'active' }, { colHeaders: ['版本', '根', '陣列'], w: 'half' }), vars({ 節點總數: this.nodes.length })];
  }
  upd(id: number, i: number, v: number, fresh: Record<number, Color>): number {
    const nd = this.nodes[id];
    if (nd.l === nd.r) { const nid = this.mk(v, nd.l, nd.r); fresh[nid] = 'swap'; return nid; }
    const m = (nd.l + nd.r) >> 1;
    const L = i <= m ? this.upd(nd.L, i, v, fresh) : nd.L;
    const R = i > m ? this.upd(nd.R, i, v, fresh) : nd.R;
    const nid = this.mk(this.nodes[L].sum + this.nodes[R].sum, nd.l, nd.r, L, R);
    fresh[nid] = 'swap';
    return nid;
  }
  run(op: string, a?: any) {
    const p = nums(a);
    if (op === 'update') {
      const i = clampInt(p[0], 0, this.n - 1), v = Math.floor(num(p[1], 0));
      const base = this.roots.length - 1;
      const fresh: Record<number, Color> = {};
      const before = this.nodes.length;
      this.roots.push(this.upd(this.roots[base], i, v, fresh));
      const arr = this.arrs[base].slice(); arr[i] = v; this.arrs.push(arr);
      this.snap(`以版本 ${base} 為基礎設定 a[${i}] = ${v}：只複製根到葉這條路徑上的 ${this.nodes.length - before} 個節點（橘色），其餘節點直接共用`, 2, { hl: fresh });
    } else {
      const ver = clampInt(p[0], 0, this.roots.length - 1, this.roots.length - 1);
      let l = clampInt(p[1], 0, this.n - 1), r = clampInt(p[2], 0, this.n - 1, this.n - 1);
      if (l > r) [l, r] = [r, l];
      const hl: Record<number, Color> = {};
      const q = (id: number): number => { const nd = this.nodes[id]; if (r < nd.l || nd.r < l) { hl[id] = 'muted'; return 0; } if (l <= nd.l && nd.r <= r) { hl[id] = 'done'; return nd.sum; } hl[id] = 'compare'; return q(nd.L) + q(nd.R); };
      const s = q(this.roots[ver]);
      this.snap(`在版本 ${ver} 查詢 sum(${l}, ${r}) = ${s}；舊版本不受之後更新影響`, 4, { ver, hl });
    }
  }
}
const persistentSeg: DSDef = {
  id: 'persistent-segment-tree', name: '持久化線段樹', en: 'Persistent Segment Tree', cat: 'ds-adv',
  desc: '更新時不修改舊節點，而是複製根到葉這條路徑上的 O(log n) 個節點，其餘子樹直接共用，並保存每個版本的根。因此每個歷史版本都能照常查詢，常用於「第 k 小」等需要比較不同版本的問題。',
  complexity: [['單點更新（建立新版本）', 'O(log n) 時間與空間'], ['任一版本的區間查詢', 'O(log n)'], ['總空間', 'O(n + q log n)']],
  codes: { update: ['update(node, i, v)：', '  建立新節點；只遞迴進入包含 i 的那一邊', '  另一邊直接指向舊版本的子節點'], query: ['', '', '', 'query(roots[ver], l, r)：與一般線段樹相同', '  舊版本的節點從未被修改'] },
  ops: [
    { key: 'update', label: '更新 i v（新版本）', arg: 'text', argLabel: 'i v', rand: () => `${rnd.int(0, 7)} ${rnd.int(0, 9)}` },
    { key: 'query', label: '查詢 版本 l r', arg: 'text', argLabel: 'ver l r', rand: () => { const l = rnd.int(0, 5); return `${rnd.int(0, 2)} ${l} ${rnd.int(l, 7)}`; } },
  ],
  create: () => new PersistentSeg(),
  init: [['update', '2 7'], ['update', '5 0']],
};

// ---------------- 可回滾並查集 ----------------
class RollbackDSU extends DSBase<Record<number, Color>> {
  n = 8;
  p = Array.from({ length: 8 }, (_, i) => i);
  sz = new Array(8).fill(1);
  hist: ([number, number] | 'save')[] = [];
  panels(c: Record<number, Color> = {}): Panel[] {
    const kids: Record<string, string[]> = { top: [] };
    for (let i = 0; i < this.n; i++) kids['u' + i] = [];
    for (let i = 0; i < this.n; i++) (this.p[i] === i ? kids.top : kids['u' + this.p[i]]).push('u' + i);
    const pos = layoutTree('top', kids, 48, 62);
    const nodes: GNode[] = Array.from({ length: this.n }, (_, i) => ({ id: 'u' + i, x: pos['u' + i].x, y: pos['u' + i].y, label: String(i), color: c[i] ?? (this.p[i] === i ? 'active' : undefined), sub: this.p[i] === i ? `size ${this.sz[i]}` : undefined }));
    const edges: GEdge[] = Array.from({ length: this.n }, (_, i) => i).filter((i) => this.p[i] !== i).map((i) => ({ from: 'u' + i, to: 'u' + this.p[i], directed: true }));
    return [{ type: 'graph', nodes, edges, title: '並查集森林（不做路徑壓縮）' }, table(this.hist.length ? [...this.hist].reverse().map((h) => (h === 'save' ? ['── 快照 ──', ''] : [`${h[0]} 接到 ${h[1]} 底下`, `size[${h[1]}] += size[${h[0]}]`])) : [['（空）', '']], {}, { colHeaders: ['修改紀錄（上方最新）', '還原時'], w: 'half' })];
  }
  find(x: number) { while (this.p[x] !== x) x = this.p[x]; return x; }
  undo() {
    const h = this.hist.pop() as [number, number];
    const [child, root] = h;
    this.p[child] = child;
    this.sz[root] -= this.sz[child];
    this.snap(`撤回：${child} 重新成為根，size[${root}] 減回 ${this.sz[root]}`, 6, { [child]: 'swap', [root]: 'compare' });
  }
  run(op: string, a?: any, b?: any) {
    const x = clampInt(a, 0, this.n - 1);
    if (op === 'union') {
      const y = clampInt(b, 0, this.n - 1, rnd.int(0, this.n - 1));
      let rx = this.find(x), ry = this.find(y);
      if (rx === ry) { this.snap(`${x} 與 ${y} 已在同一集合，不記錄任何修改`, 2, { [rx]: 'done' }); return; }
      if (this.sz[rx] > this.sz[ry]) [rx, ry] = [ry, rx];
      this.p[rx] = ry;
      this.sz[ry] += this.sz[rx];
      this.hist.push([rx, ry]);
      this.snap(`依大小合併：較小集合的根 ${rx} 接到 ${ry} 底下，並把這次修改推入紀錄堆疊`, 3, { [rx]: 'swap', [ry]: 'done' });
    } else if (op === 'find') {
      const path: number[] = [x];
      let r = x;
      while (this.p[r] !== r) { r = this.p[r]; path.push(r); }
      this.snap(`find(${x}) = ${r}（不做路徑壓縮，否則撤回時無法還原；依大小合併保證深度 O(log n)）`, 1, Object.fromEntries(path.map((v) => [v, v === r ? 'done' : 'compare'])));
    } else if (op === 'save') { this.hist.push('save'); this.snap('記下快照：之後可以回滾到這裡', 4); }
    else if (op === 'rollback') {
      if (!this.hist.length) { this.snap('沒有任何紀錄可回滾'); return; }
      while (this.hist.length && this.hist[this.hist.length - 1] !== 'save') this.undo();
      if (this.hist.length) this.hist.pop();
      this.snap('已回滾到最近的快照', 5);
    }
  }
}
const rollbackDsu: DSDef = {
  id: 'rollback-dsu', name: '可回滾並查集', en: 'Rollback DSU', cat: 'ds-adv',
  desc: '把每次 union 的修改（哪個根接到哪個根底下）推入堆疊，就能依相反順序撤回到之前的快照。為了能精確還原，不使用路徑壓縮，改用「依大小合併」保證樹高 O(log n)。常用於離線動態連通性與分治演算法。',
  complexity: [['find', 'O(log n)'], ['union', 'O(log n)'], ['撤回一次修改', 'O(1)']],
  codes: { find: ['find(x)：沿 parent 走到根（不壓縮路徑）'], union: ['', '', 'rx, ry = find(x), find(y)；相同則不記錄', '小的根接到大的根底下，紀錄 (rx, ry)'], save: ['', '', '', '', '推入快照標記'], rollback: ['', '', '', '', '', '一直撤回到最近的快照標記', '  撤回 (rx, ry)：parent[rx] = rx；size[ry] −= size[rx]'] },
  ops: [
    { key: 'union', label: 'union(x, y)', arg: 'two', argLabel: 'x y', rand: () => [rnd.int(0, 7), rnd.int(0, 7)] },
    { key: 'find', label: 'find(x)', arg: 'number', rand: () => rnd.int(0, 7) },
    { key: 'save', label: '記下快照', arg: 'none' },
    { key: 'rollback', label: '回滾到快照', arg: 'none' },
  ],
  create: () => new RollbackDSU(),
  init: [['union', 0, 1], ['union', 2, 3], ['save'], ['union', 1, 3], ['union', 4, 5]],
};

// ---------------- 帶權並查集 ----------------
class WeightedDSU extends DSBase<Record<number, Color>> {
  n = 8;
  p = Array.from({ length: 8 }, (_, i) => i);
  d = new Array(8).fill(0); // d[x] = val[x] − val[parent[x]]
  log: string[] = [];
  panels(c: Record<number, Color> = {}): Panel[] {
    const kids: Record<string, string[]> = { top: [] };
    for (let i = 0; i < this.n; i++) kids['u' + i] = [];
    for (let i = 0; i < this.n; i++) (this.p[i] === i ? kids.top : kids['u' + this.p[i]]).push('u' + i);
    const pos = layoutTree('top', kids, 52, 66);
    const nodes: GNode[] = Array.from({ length: this.n }, (_, i) => ({ id: 'u' + i, x: pos['u' + i].x, y: pos['u' + i].y, label: String(i), color: c[i] ?? (this.p[i] === i ? 'active' : undefined) }));
    const edges: GEdge[] = Array.from({ length: this.n }, (_, i) => i).filter((i) => this.p[i] !== i).map((i) => ({ from: 'u' + i, to: 'u' + this.p[i], directed: true, label: `${this.d[i] >= 0 ? '+' : ''}${this.d[i]}` }));
    return [{ type: 'graph', nodes, edges, title: '邊上的數字 = val[子] − val[父]' }, text(this.log.length ? this.log : ['（尚無條件）'], '已加入的條件')];
  }
  find(x: number): [number, number] {
    if (this.p[x] === x) return [x, 0];
    const [r, w] = this.find(this.p[x]);
    this.d[x] += w;
    this.p[x] = r;
    return [r, this.d[x]];
  }
  run(op: string, a?: any) {
    const v = nums(a);
    const x = clampInt(v[0], 0, this.n - 1), y = clampInt(v[1], 0, this.n - 1, 1);
    const [rx, dx] = this.find(x), [ry, dy] = this.find(y);
    this.snap(`路徑壓縮後：val[${x}] − val[${rx}] = ${dx}，val[${y}] − val[${ry}] = ${dy}`, 1, { [x]: 'compare', [y]: 'compare', [rx]: 'active', [ry]: 'active' });
    if (op === 'relate') {
      const w = Math.floor(num(v[2], 0));
      if (rx === ry) {
        const ok = dx - dy === w;
        this.snap(ok ? `已在同一集合，現有關係 val[${x}] − val[${y}] = ${dx - dy}，與新條件一致` : `衝突！現有關係推得 val[${x}] − val[${y}] = ${dx - dy}，但新條件要求 ${w}`, 3, { [x]: ok ? 'good' : 'bad', [y]: ok ? 'good' : 'bad' });
        if (ok) this.log.push(`val[${x}] − val[${y}] = ${w}（多餘）`);
        return;
      }
      this.p[rx] = ry;
      this.d[rx] = w - dx + dy;
      this.log.push(`val[${x}] − val[${y}] = ${w}`);
      this.snap(`合併：${rx} 接到 ${ry} 底下，d[${rx}] = w − dx + dy = ${w} − ${dx} + ${dy} = ${this.d[rx]}`, 4, { [rx]: 'swap', [ry]: 'done' });
    } else {
      this.snap(rx === ry ? `val[${x}] − val[${y}] = ${dx} − ${dy} = ${dx - dy}` : `${x} 與 ${y} 不在同一集合：差值未知`, 6, { [x]: rx === ry ? 'done' : 'bad', [y]: rx === ry ? 'done' : 'bad' });
    }
  }
}
const weightedDsu: DSDef = {
  id: 'weighted-dsu', name: '帶權並查集', en: 'Weighted DSU', cat: 'ds-adv',
  desc: '每個節點記錄與父節點的「勢能差」d[x] = val[x] − val[parent]，路徑壓縮時把沿途的差值累加起來。可以維護「x 比 y 多 w」這類相對關係：合併時算出兩個根之間的差值；兩者已在同一集合時檢查新條件是否與既有關係矛盾。',
  complexity: [['find / relate / diff（均攤）', 'O(α(n))'], ['空間', 'O(n)']],
  codes: { relate: ['find(x)：遞迴到根，回溯時 d[x] += d[parent]，再把 x 直接接到根', '', 'relate(x, y, w)：要求 val[x] − val[y] = w', '  同一集合：檢查 dx − dy == w，否則回報衝突', '  不同集合：parent[rx] = ry；d[rx] = w − dx + dy'], diff: ['', '', '', '', '', '', 'diff(x, y)：同一集合時為 dx − dy，否則未知'] },
  ops: [
    { key: 'relate', label: '加入 val[x] − val[y] = w', arg: 'text', argLabel: 'x y w', rand: () => `${rnd.int(0, 7)} ${rnd.int(0, 7)} ${rnd.int(-5, 5)}` },
    { key: 'diff', label: '查詢 val[x] − val[y]', arg: 'text', argLabel: 'x y', rand: () => `${rnd.int(0, 7)} ${rnd.int(0, 7)}` },
  ],
  create: () => new WeightedDSU(),
  init: [['relate', '1 0 3'], ['relate', '2 1 2'], ['relate', '4 3 -1'], ['relate', '5 4 4']],
};

// ---------------- k 維樹 ----------------
interface KD { p: [number, number]; axis: number; left: KD | null; right: KD | null; box: [number, number, number, number] }
const DEF_PTS: [number, number][] = [[30, 40], [5, 25], [70, 70], [10, 12], [50, 30], [35, 45], [80, 15], [60, 85], [20, 75], [90, 55], [45, 60]];
class KDTree extends DSBase<{ hl?: Set<KD>; q?: [number, number]; best?: KD | null; r?: number }> {
  pts: [number, number][] = DEF_PTS.map((p) => [p[0], p[1]]);
  root: KD | null = null;
  constructor() { super(); this.root = this.build(this.pts, 0, [0, 100, 0, 100]); }
  build(ps: [number, number][], depth: number, box: [number, number, number, number]): KD | null {
    if (!ps.length) return null;
    const axis = depth % 2;
    const s = [...ps].sort((a, b) => a[axis] - b[axis] || a[1 - axis] - b[1 - axis]);
    const m = s.length >> 1;
    const node: KD = { p: s[m], axis, left: null, right: null, box };
    const v = s[m][axis];
    node.left = this.build(s.slice(0, m), depth + 1, axis ? [box[0], box[1], box[2], v] : [box[0], v, box[2], box[3]]);
    node.right = this.build(s.slice(m + 1), depth + 1, axis ? [box[0], box[1], v, box[3]] : [v, box[1], box[2], box[3]]);
    return node;
  }
  panels(h: { hl?: Set<KD>; q?: [number, number]; best?: KD | null; r?: number } = {}): Panel[] {
    const segments: PlotPanel['segments'] = [];
    const points: PlotPanel['points'] = [];
    const walk = (n: KD | null) => {
      if (!n) return;
      const [x0, x1, y0, y1] = n.box;
      segments.push(n.axis === 0 ? { x1: n.p[0], y1: y0, x2: n.p[0], y2: y1, color: h.hl?.has(n) ? 'compare' : 'muted' } : { x1: x0, y1: n.p[1], x2: x1, y2: n.p[1], color: h.hl?.has(n) ? 'compare' : 'muted' });
      points.push({ x: n.p[0], y: n.p[1], color: h.best === n ? 'done' : h.hl?.has(n) ? 'compare' : 'active', label: `(${n.p[0]},${n.p[1]})` });
      walk(n.left); walk(n.right);
    };
    walk(this.root);
    if (h.q) points.push({ x: h.q[0], y: h.q[1], color: 'bad', label: '查詢', r: 6 });
    const plot: PlotPanel = { type: 'plot', title: '交替以 x（直線）與 y（橫線）切分平面', bounds: [0, 100, 0, 100], square: true, segments, points, circles: h.q && h.r !== undefined ? [{ x: h.q[0], y: h.q[1], r: h.r, color: 'done' }] : [] };
    return [plot, binaryPanel(this.toB(this.root), { label: (n) => String(n.val), color: (n) => (h.best && n.ref === h.best ? 'done' : h.hl?.has(n.ref) ? 'compare' : undefined), sub: (n) => (n.ref.axis ? 'y' : 'x'), title: '樹的結構（下方為切分軸）', w: 'half' })];
  }
  toB(n: KD | null, ids = { v: 0 }): BNode | null { if (!n) return null; return { id: ids.v++, val: `${n.p[0]},${n.p[1]}`, ref: n, left: this.toB(n.left, ids), right: this.toB(n.right, ids) }; }
  run(op: string, a?: any) {
    const v = nums(a);
    if (op === 'random') { this.pts = Array.from({ length: 11 }, () => [rnd.int(2, 98), rnd.int(2, 98)] as [number, number]); this.root = this.build(this.pts, 0, [0, 100, 0, 100]); this.snap('隨機點並以中位數重新建樹（平衡）', 1); return; }
    const q: [number, number] = [Math.floor(num(v[0], 50)), Math.floor(num(v[1], 50))];
    if (op === 'insert') {
      let n = this.root, depth = 0, parent: KD | null = null, goLeft = false;
      while (n) { parent = n; goLeft = q[n.axis] < n.p[n.axis]; n = goLeft ? n.left : n.right; depth++; }
      this.pts.push(q);
      if (!parent) { this.root = { p: q, axis: 0, left: null, right: null, box: [0, 100, 0, 100] }; this.snap('樹是空的，成為根'); return; }
      const pb = parent.box, pv = parent.p[parent.axis];
      const box: [number, number, number, number] = parent.axis ? (goLeft ? [pb[0], pb[1], pb[2], pv] : [pb[0], pb[1], pv, pb[3]]) : goLeft ? [pb[0], pv, pb[2], pb[3]] : [pv, pb[1], pb[2], pb[3]];
      const nn: KD = { p: q, axis: depth % 2, left: null, right: null, box };
      if (goLeft) parent.left = nn; else parent.right = nn;
      this.snap(`沿切分軸往下走，插在深度 ${depth}（不重新平衡，大量插入後可能變得不平衡）`, 2, { hl: new Set([nn]) });
      return;
    }
    const d2 = (n: KD) => (n.p[0] - q[0]) ** 2 + (n.p[1] - q[1]) ** 2;
    let best: KD | null = null, bd = Infinity, visited = 0;
    const seen = new Set<KD>();
    const go = (n: KD | null) => {
      if (!n) return;
      visited++;
      seen.add(n);
      if (d2(n) < bd) { bd = d2(n); best = n; }
      this.snap(`拜訪 (${n.p[0]},${n.p[1]})，距離 ${Math.sqrt(d2(n)).toFixed(2)}；目前最近 (${best!.p[0]},${best!.p[1]})`, 4, { hl: new Set(seen), q, best, r: Math.sqrt(bd) });
      const diff = q[n.axis] - n.p[n.axis];
      const [near, far] = diff < 0 ? [n.left, n.right] : [n.right, n.left];
      go(near);
      if (diff * diff < bd) { if (far) this.snap(`到切分線的距離 ${Math.abs(diff)} < 目前半徑 ${Math.sqrt(bd).toFixed(2)}：另一側可能有更近的點，必須檢查`, 6, { hl: new Set(seen), q, best, r: Math.sqrt(bd) }); go(far); }
      else if (far) this.snap(`到切分線的距離 ${Math.abs(diff)} ≥ 目前半徑 ${Math.sqrt(bd).toFixed(2)}：另一側整個剪掉`, 5, { hl: new Set(seen), q, best, r: Math.sqrt(bd) });
    };
    go(this.root);
    const bruteD = Math.min(...this.pts.map((p) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2));
    const b = best as KD | null;
    this.snap(b ? `最近點 (${b.p[0]},${b.p[1]})，距離 ${Math.sqrt(bd).toFixed(2)}；只拜訪了 ${visited}/${this.pts.length} 個點（暴力法距離 ${Math.sqrt(bruteD).toFixed(2)}）` : '樹是空的', 7, { hl: seen, q, best: b, r: Math.sqrt(bd) });
  }
}
const kdTree: DSDef = {
  id: 'kd-tree', name: 'k 維樹', en: 'k-d Tree', cat: 'ds-adv',
  desc: '二維情況下交替用 x 與 y 座標的中位數切分平面建成平衡二元樹。最近鄰查詢先往查詢點所在的一側走到底得到候選答案，回溯時只有當「到切分線的距離」小於目前最近距離才需要檢查另一側，否則整個子樹剪掉。資料分布不佳或維度高時剪枝效果會變差。',
  complexity: [['建樹', 'O(n log n)'], ['最近鄰查詢', '平均 O(log n)，最壞 O(n)'], ['插入（不重新平衡）', 'O(深度)']],
  codes: { random: ['依目前深度選切分軸，取中位數為節點', '左右兩半遞迴建樹'], insert: ['', '', '沿切分軸比較往下走，插在葉子'], nearest: ['', '', '', 'nearest(node)：', '  更新目前最近點；先遞迴走查詢點所在的一側', '  若 |q[axis] − node[axis]| ≥ 目前最近距離：剪掉另一側', '  否則也要遞迴檢查另一側', 'return 最近點'] },
  ops: [
    { key: 'nearest', label: '最近鄰(x, y)', arg: 'text', argLabel: 'x y', rand: () => `${rnd.int(0, 100)} ${rnd.int(0, 100)}` },
    { key: 'insert', label: '插入點', arg: 'text', argLabel: 'x y', rand: () => `${rnd.int(0, 100)} ${rnd.int(0, 100)}` },
    { key: 'random', label: '隨機點並重建', arg: 'none' },
  ],
  create: () => new KDTree(),
};

// ---------------- 四元樹 ----------------
interface QT { x0: number; y0: number; s: number; pts: [number, number][]; kids: QT[] | null; depth: number }
class Quadtree extends DSBase<{ hl?: Set<QT>; found?: [number, number][]; rect?: [number, number, number, number] }> {
  CAP = 1;
  MAXD = 5;
  root: QT = { x0: 0, y0: 0, s: 64, pts: [], kids: null, depth: 0 };
  count = 0;
  panels(h: { hl?: Set<QT>; found?: [number, number][]; rect?: [number, number, number, number] } = {}): Panel[] {
    const polygons: PlotPanel['polygons'] = [];
    const points: PlotPanel['points'] = [];
    const walk = (n: QT) => {
      polygons.push({ pts: [[n.x0, n.y0], [n.x0 + n.s, n.y0], [n.x0 + n.s, n.y0 + n.s], [n.x0, n.y0 + n.s]], color: h.hl?.has(n) ? 'compare' : 'muted' });
      for (const p of n.pts) points.push({ x: p[0], y: p[1], color: h.found?.some((f) => f[0] === p[0] && f[1] === p[1]) ? 'done' : 'active' });
      n.kids?.forEach(walk);
    };
    walk(this.root);
    if (h.rect) polygons.push({ pts: [[h.rect[0], h.rect[1]], [h.rect[2], h.rect[1]], [h.rect[2], h.rect[3]], [h.rect[0], h.rect[3]]], color: 'bad', fill: true, dashed: true });
    return [{ type: 'plot', title: `平面 [0, 64)²；每格最多 ${this.CAP} 個點，最大深度 ${this.MAXD}`, bounds: [0, 64, 0, 64], square: true, polygons, points }, vars({ 點數: this.count })];
  }
  insert(n: QT, p: [number, number], path: Set<QT>): void {
    path.add(n);
    if (!n.kids) {
      if (n.pts.length < this.CAP || n.depth >= this.MAXD) { n.pts.push(p); return; }
      const h = n.s / 2;
      n.kids = [[0, 0], [h, 0], [0, h], [h, h]].map(([dx, dy]) => ({ x0: n.x0 + dx, y0: n.y0 + dy, s: h, pts: [], kids: null, depth: n.depth + 1 }));
      const old = n.pts;
      n.pts = [];
      this.snap(`格子 (${n.x0},${n.y0}) 大小 ${n.s} 已滿：分成四個子格，把原本的點往下移`, 2, { hl: new Set([n]) });
      for (const q of old) this.insert(n, q, new Set());
    }
    const h = n.s / 2;
    const k = (p[0] >= n.x0 + h ? 1 : 0) + (p[1] >= n.y0 + h ? 2 : 0);
    this.insert(n.kids![k], p, path);
  }
  run(op: string, a?: any) {
    const v = nums(a);
    if (op === 'insert') {
      const p: [number, number] = [clampInt(v[0], 0, 63), clampInt(v[1], 0, 63)];
      const path = new Set<QT>();
      this.insert(this.root, p, path);
      this.count++;
      this.snap(`插入 (${p[0]},${p[1]})：從根往下走到所在的葉格` + (path.size - 1 >= this.MAXD ? '（已達最大深度，允許多個點，避免相同座標無限分割）' : ''), 1, { hl: path, found: [p] });
    } else {
      let [x1, y1, x2, y2] = [num(v[0], 10), num(v[1], 10), num(v[2], 40), num(v[3], 40)];
      if (x1 > x2) [x1, x2] = [x2, x1];
      if (y1 > y2) [y1, y2] = [y2, y1];
      const rect: [number, number, number, number] = [x1, y1, x2, y2];
      const hl = new Set<QT>(), found: [number, number][] = [];
      let skipped = 0;
      const go = (n: QT) => {
        if (n.x0 > x2 || n.x0 + n.s <= x1 || n.y0 > y2 || n.y0 + n.s <= y1) { skipped++; return; }
        hl.add(n);
        for (const p of n.pts) if (p[0] >= x1 && p[0] <= x2 && p[1] >= y1 && p[1] <= y2) found.push(p);
        n.kids?.forEach(go);
      };
      go(this.root);
      this.snap(`範圍 [${x1},${x2}]×[${y1},${y2}] 內有 ${found.length} 個點；只走進與範圍相交的 ${hl.size} 格，略過 ${skipped} 個不相交的子樹`, 4, { hl, found, rect });
    }
  }
}
const quadtree: DSDef = {
  id: 'quadtree', name: '四元樹', en: 'Quadtree', cat: 'ds-adv',
  desc: '把平面遞迴切成四個象限：格子裡的點超過容量就分裂成四個子格。範圍查詢時只走進與查詢矩形相交的格子，大片空白或不相交的區域整個略過。為了避免相同座標的點無限分裂，設定最大深度，到達時允許一格存多個點。',
  complexity: [['插入', 'O(深度)'], ['範圍查詢', '與相交格子數 + 結果數成正比'], ['最大深度', '本頁限制為 5']],
  codes: { insert: ['從根走到點所在的葉格', '  若葉格已滿且未達最大深度：分成四格，原有的點往下移', '  否則放進這一格'], range: ['', '', '', 'range(node, R)：', '  若格子與 R 不相交：略過', '  檢查格內的點，並遞迴四個子格'] },
  ops: [
    { key: 'insert', label: '插入點', arg: 'text', argLabel: 'x y（0–63）', rand: () => `${rnd.int(0, 63)} ${rnd.int(0, 63)}` },
    { key: 'range', label: '範圍查詢', arg: 'text', argLabel: 'x1 y1 x2 y2', rand: () => { const x = rnd.int(0, 40), y = rnd.int(0, 40); return `${x} ${y} ${x + rnd.int(8, 24)} ${y + rnd.int(8, 24)}`; } },
  ],
  create: () => new Quadtree(),
  init: [['insert', '10 10'], ['insert', '50 12'], ['insert', '20 40'], ['insert', '30 35'], ['insert', '55 55'], ['insert', '8 52'], ['insert', '40 20'], ['insert', '45 22']],
};

// ---------------- 二維樹狀陣列 ----------------
class Fenwick2D extends DSBase<{ t?: Record<string, Color>; a?: Record<string, Color> }> {
  n = 6;
  a = Array.from({ length: 6 }, () => new Array(6).fill(0));
  t = Array.from({ length: 7 }, () => new Array(7).fill(0));
  panels(h: { t?: Record<string, Color>; a?: Record<string, Color> } = {}): Panel[] {
    return [table(this.a, h.a ?? {}, { title: '原矩陣 a（1 起算）', rowHeaders: this.a.map((_, i) => i + 1), colHeaders: this.a.map((_, i) => i + 1), w: 'half' }), table(this.t.slice(1).map((r) => r.slice(1)), h.t ?? {}, { title: '樹狀陣列 t[i][j]', rowHeaders: this.a.map((_, i) => i + 1), colHeaders: this.a.map((_, i) => i + 1), w: 'half' })];
  }
  prefix(r: number, c: number, mark: Record<string, Color>) { let s = 0; for (let i = r; i > 0; i -= i & -i) for (let j = c; j > 0; j -= j & -j) { s += this.t[i][j]; mark[`${i - 1},${j - 1}`] = 'compare'; } return s; }
  run(op: string, a?: any) {
    const v = nums(a);
    if (op === 'add') {
      const r = clampInt(v[0], 1, this.n), c = clampInt(v[1], 1, this.n), d = Math.floor(num(v[2], 1));
      this.a[r - 1][c - 1] += d;
      const mark: Record<string, Color> = {};
      for (let i = r; i <= this.n; i += i & -i) for (let j = c; j <= this.n; j += j & -j) { this.t[i][j] += d; mark[`${i - 1},${j - 1}`] = 'swap'; }
      this.snap(`a[${r}][${c}] += ${d}：列方向 i += lowbit(i)、行方向 j += lowbit(j)，共更新 ${Object.keys(mark).length} 格`, 2, { t: mark, a: { [`${r - 1},${c - 1}`]: 'swap' } });
    } else {
      let [r1, c1, r2, c2] = [clampInt(v[0], 1, this.n), clampInt(v[1], 1, this.n), clampInt(v[2], 1, this.n, this.n), clampInt(v[3], 1, this.n, this.n)];
      if (r1 > r2) [r1, r2] = [r2, r1];
      if (c1 > c2) [c1, c2] = [c2, c1];
      const mark: Record<string, Color> = {};
      const S = (r: number, c: number) => this.prefix(r, c, mark);
      const ans = S(r2, c2) - S(r1 - 1, c2) - S(r2, c1 - 1) + S(r1 - 1, c1 - 1);
      let brute = 0;
      const am: Record<string, Color> = {};
      for (let i = r1; i <= r2; i++) for (let j = c1; j <= c2; j++) { brute += this.a[i - 1][j - 1]; am[`${i - 1},${j - 1}`] = 'path'; }
      this.snap(`sum = S(${r2},${c2}) − S(${r1 - 1},${c2}) − S(${r2},${c1 - 1}) + S(${r1 - 1},${c1 - 1}) = ${ans}（逐格相加 ${brute}）`, 4, { t: mark, a: am });
    }
  }
}
const fenwick2d: DSDef = {
  id: 'fenwick-2d', name: '二維樹狀陣列', en: '2D Fenwick Tree', cat: 'ds-adv',
  desc: '把樹狀陣列的「沿 lowbit 跳」推廣到兩個維度：單點更新時列與行各自沿 lowbit 往上更新，前綴和查詢時各自沿 lowbit 往下累加，各 O(log n · log m)。任意矩形和再用二維前綴和的四項加減得到。',
  complexity: [['單點更新', 'O(log n · log m)'], ['矩形和查詢', 'O(log n · log m)'], ['空間', 'O(nm)']],
  codes: { add: ['add(r, c, v)：', '  for i = r; i <= n; i += lowbit(i): for j = c; j <= m; j += lowbit(j): t[i][j] += v'], sum: ['', '', 'S(r, c)：for i = r; i > 0; i −= lowbit(i): for j = c; j > 0; j −= lowbit(j): s += t[i][j]', 'sum(r1, c1, r2, c2) = S(r2,c2) − S(r1−1,c2) − S(r2,c1−1) + S(r1−1,c1−1)', ''] },
  ops: [
    { key: 'add', label: '單點加值', arg: 'text', argLabel: 'r c v（1 起算）', rand: () => `${rnd.int(1, 6)} ${rnd.int(1, 6)} ${rnd.int(1, 9)}` },
    { key: 'sum', label: '矩形和', arg: 'text', argLabel: 'r1 c1 r2 c2', rand: () => { const r = rnd.int(1, 4), c = rnd.int(1, 4); return `${r} ${c} ${rnd.int(r, 6)} ${rnd.int(c, 6)}`; } },
  ],
  create: () => new Fenwick2D(),
  init: [['add', '1 1 3'], ['add', '2 3 5'], ['add', '4 2 2'], ['add', '3 5 4'], ['add', '6 6 1'], ['add', '5 4 6']],
};

// ---------------- 資料流中位數 ----------------
class StreamMedian extends DSBase<{ lo?: number; hi?: number }> {
  lo: number[] = []; // 最大堆積
  hi: number[] = []; // 最小堆積
  stream: number[] = [];
  push(h: number[], x: number, less: (a: number, b: number) => boolean) { h.push(x); let i = h.length - 1; while (i && less(h[i], h[(i - 1) >> 1])) { [h[i], h[(i - 1) >> 1]] = [h[(i - 1) >> 1], h[i]]; i = (i - 1) >> 1; } }
  pop(h: number[], less: (a: number, b: number) => boolean) { const top = h[0]; const last = h.pop()!; if (h.length) { h[0] = last; let i = 0; for (;;) { let m = i; const l = 2 * i + 1, r = l + 1; if (l < h.length && less(h[l], h[m])) m = l; if (r < h.length && less(h[r], h[m])) m = r; if (m === i) break; [h[i], h[m]] = [h[m], h[i]]; i = m; } } return top; }
  maxL = (a: number, b: number) => a > b;
  minL = (a: number, b: number) => a < b;
  heapPanel(h: number[], title: string, top: Color, hl?: number) {
    const nodes: BNode[] = h.map((v, i) => ({ id: i, val: v, left: null, right: null }));
    nodes.forEach((n, i) => { n.left = nodes[2 * i + 1] ?? null; n.right = nodes[2 * i + 2] ?? null; });
    return binaryPanel(nodes[0] ?? null, { color: (n) => (n.id === 0 ? top : n.val === hl ? 'swap' : undefined), title, w: 'half' as const });
  }
  median() { if (!this.lo.length) return null; return this.lo.length > this.hi.length ? this.lo[0] : (this.lo[0] + this.hi[0]) / 2; }
  panels(h: { lo?: number; hi?: number } = {}): Panel[] {
    return [this.heapPanel(this.lo, `左半：最大堆積（${this.lo.length} 個）`, 'active', h.lo), this.heapPanel(this.hi, `右半：最小堆積（${this.hi.length} 個）`, 'special', h.hi), cells(this.stream.length ? this.stream : ['（空）'], {}, { title: '資料流' }), vars({ 中位數: this.median() ?? '—' }, undefined, { 中位數: 'done' })];
  }
  run(op: string, a?: any) {
    if (op === 'clear') { this.lo = []; this.hi = []; this.stream = []; this.snap('清空'); return; }
    const x = Math.floor(num(a));
    this.stream.push(x);
    if (!this.lo.length || x <= this.lo[0]) { this.push(this.lo, x, this.maxL); this.snap(`${x} ≤ 左半最大值，放進左邊的最大堆積`, 1, { lo: x }); }
    else { this.push(this.hi, x, this.minL); this.snap(`${x} > 左半最大值，放進右邊的最小堆積`, 1, { hi: x }); }
    if (this.lo.length > this.hi.length + 1) { const v = this.pop(this.lo, this.maxL); this.push(this.hi, v, this.minL); this.snap(`左邊多了 2 個：把左半最大值 ${v} 移到右邊`, 2, { hi: v }); }
    else if (this.hi.length > this.lo.length) { const v = this.pop(this.hi, this.minL); this.push(this.lo, v, this.maxL); this.snap(`右邊比較多：把右半最小值 ${v} 移到左邊`, 2, { lo: v }); }
    const m = this.median()!;
    this.snap(this.stream.length % 2 ? `共 ${this.stream.length} 筆（奇數）：中位數 = 左半最大值 ${m}` : `共 ${this.stream.length} 筆（偶數）：中位數 = (${this.lo[0]} + ${this.hi[0]}) / 2 = ${m}`, 3);
  }
}
const streamMedian: DSDef = {
  id: 'streaming-median', name: '資料流中位數', en: 'Streaming Median', cat: 'ds-adv',
  desc: '資料一筆一筆進來，隨時回答目前的中位數。用最大堆積存較小的一半、最小堆積存較大的一半，並保持左邊的個數等於右邊或多一個：中位數就是左邊堆頂（奇數筆）或兩個堆頂的平均（偶數筆）。可處理重複值與負數。',
  complexity: [['加入一筆', 'O(log n)'], ['查詢中位數', 'O(1)'], ['空間', 'O(n)']],
  codes: { add: ['若 x ≤ 左堆頂：放入左邊最大堆積，否則放入右邊最小堆積', '平衡：|左| 必須等於 |右| 或 |右| + 1，多的移過去', '中位數 = 奇數筆 ? 左堆頂 : (左堆頂 + 右堆頂) / 2'] },
  ops: [
    { key: 'add', label: '加入數字', arg: 'number', rand: () => rnd.int(-20, 60) },
    { key: 'clear', label: '清空', arg: 'none' },
  ],
  create: () => new StreamMedian(),
  init: [['add', 5], ['add', 15], ['add', 1], ['add', 3], ['add', 8]],
};

export default [cuckoo, robinHood, treap, ost, binaryTrie, radixTree, sparseTable, sqrtDecomp, persistentSeg, rollbackDsu, weightedDsu, kdTree, quadtree, fenwick2d, streamMedian] satisfies DSDef[];
