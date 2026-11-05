import type { Color, DSDef, Panel } from '../core/types';
import { cells, vars, rnd } from '../core/helpers';
import { listPanel, rowPos, GAP, type LL } from '../core/list';
import { DSBase, num } from './base';

const cat = 'ds-linear';
const rv = () => rnd.int(1, 99);
type CM = Record<number, Color | undefined>;

// ---------------- 陣列 ----------------

class ArrayDS extends DSBase<{ c?: CM; p?: Record<string, number> }> {
  cap = 12;
  a: (number | null)[] = new Array(12).fill(null);
  n = 0;
  panels(h: { c?: CM; p?: Record<string, number> } = {}): Panel[] {
    const c: CM = {};
    for (let i = this.n; i < this.cap; i++) c[i] = 'muted';
    return [cells(this.a, { ...c, ...h.c }, { title: `靜態陣列（容量 ${this.cap}，灰色為未使用）`, pointers: Object.entries(h.p ?? {}).map(([label, index]) => ({ label, index })) }), vars({ 長度: this.n, 容量: this.cap })];
  }
  run(op: string, a?: any, b?: any) {
    if (op === 'fill') { this.n = 0; this.a.fill(null); for (const v of rnd.arr(7)) this.a[this.n++] = v; this.snap('隨機填入 7 個元素'); return; }
    if (op === 'get') {
      const i = num(a);
      if (i < 0 || i >= this.n) { this.snap(`索引 ${i} 超出範圍`, 1); return; }
      this.snap(`隨機存取 a[${i}] = ${this.a[i]}：位址 = base + ${i} × 元素大小，O(1)`, 1, { c: { [i]: 'done' }, p: { i } });
      return;
    }
    if (op === 'set') {
      const i = num(a), v = num(b, rv());
      if (i < 0 || i >= this.n) { this.snap(`索引 ${i} 超出範圍`, 1); return; }
      this.a[i] = v;
      this.snap(`a[${i}] = ${v}，O(1)`, 1, { c: { [i]: 'swap' }, p: { i } });
      return;
    }
    if (op === 'insert') {
      const i = Math.max(0, Math.min(num(a), this.n)), v = num(b, rv());
      if (this.n >= this.cap) { this.snap('陣列已滿，無法插入（靜態陣列不能擴充）', 1, { c: Object.fromEntries(this.a.map((_, k) => [k, 'bad'])) }); return; }
      this.snap(`在索引 ${i} 插入 ${v}：需要把 [${i}..${this.n - 1}] 往右移一格`, 1, { p: { i } });
      for (let k = this.n; k > i; k--) { this.a[k] = this.a[k - 1]; this.snap(`a[${k}] = a[${k - 1}]`, 2, { c: { [k]: 'swap', [k - 1]: 'compare' } }); }
      this.a[i] = v; this.n++;
      this.snap(`a[${i}] = ${v}，插入完成（最差 O(n)）`, 3, { c: { [i]: 'done' } });
      return;
    }
    if (op === 'delete') {
      const i = num(a);
      if (i < 0 || i >= this.n) { this.snap(`索引 ${i} 超出範圍`, 1); return; }
      this.snap(`刪除 a[${i}] = ${this.a[i]}`, 4, { c: { [i]: 'bad' } });
      for (let k = i; k < this.n - 1; k++) { this.a[k] = this.a[k + 1]; this.snap(`a[${k}] = a[${k + 1}]（左移）`, 5, { c: { [k]: 'swap', [k + 1]: 'compare' } }); }
      this.a[--this.n] = null;
      this.snap('刪除完成（最差 O(n)）', 6);
      return;
    }
    if (op === 'search') {
      const v = num(a);
      for (let k = 0; k < this.n; k++) {
        this.snap(`比較 a[${k}] = ${this.a[k]}`, 7, { c: { [k]: 'compare' }, p: { k } });
        if (this.a[k] === v) { this.snap(`找到 ${v}，索引 ${k}`, 7, { c: { [k]: 'done' } }); return; }
      }
      this.snap(`找不到 ${v}`, 7);
    }
  }
}

const arrayDS: DSDef = {
  id: 'ds-array', name: '陣列', en: 'Array', cat, star: true,
  desc: '在連續記憶體中存放固定數量的元素，可用索引 O(1) 隨機存取；但在中間插入或刪除時，必須搬移後面所有元素。',
  complexity: [['存取 a[i]', 'O(1)'], ['搜尋', 'O(n)'], ['插入／刪除（中間）', 'O(n)'], ['空間', 'O(n)']],
  codes: { insert: ['insert(i, v): for k = n down to i+1: a[k] = a[k-1]', '  （元素逐一右移）', '  a[i] = v; n++'], delete: ['', '', '', 'delete(i):', '  for k = i .. n-2: a[k] = a[k+1]', '  n--'] },
  ops: [
    { key: 'get', label: '存取 a[i]', arg: 'number', argLabel: 'i', rand: () => rnd.int(0, 5) },
    { key: 'set', label: '修改 a[i]=v', arg: 'two', argLabel: 'i v', rand: () => [rnd.int(0, 5), rv()] },
    { key: 'insert', label: '插入(i, v)', arg: 'two', argLabel: 'i v', rand: () => [rnd.int(0, 6), rv()] },
    { key: 'delete', label: '刪除 a[i]', arg: 'number', argLabel: 'i', rand: () => rnd.int(0, 5) },
    { key: 'search', label: '搜尋', arg: 'number', rand: rv },
    { key: 'fill', label: '隨機填入', arg: 'none' },
  ],
  create: () => new ArrayDS(),
  init: [['fill']],
};

class DynArray extends DSBase<{ c?: CM; old?: (number | null)[] }> {
  cap = 2;
  a: (number | null)[] = [null, null];
  n = 0;
  total = 0;
  panels(h: { c?: CM; old?: (number | null)[] } = {}): Panel[] {
    const c: CM = {};
    for (let i = this.n; i < this.cap; i++) c[i] = 'muted';
    return [...(h.old ? [cells(h.old, Object.fromEntries(h.old.map((_, i) => [i, 'visited'])), { title: '舊陣列（將被釋放）' })] : []), cells(this.a, { ...c, ...h.c }, { title: `動態陣列：長度 ${this.n} / 容量 ${this.cap}` }), vars({ 長度: this.n, 容量: this.cap, 累計搬移次數: this.total, 均攤每次push: this.n ? +(this.total / Math.max(1, this.n)).toFixed(2) : 0 })];
  }
  run(op: string, a?: any) {
    if (op === 'push') {
      const v = num(a, rv());
      if (this.n === this.cap) {
        const old = [...this.a];
        this.snap(`容量 ${this.cap} 已滿，配置兩倍容量 ${this.cap * 2} 的新陣列`, 2, { old, c: Object.fromEntries(this.a.map((_, i) => [i, 'bad'])) });
        this.cap *= 2;
        this.a = [...this.a, ...new Array(this.cap - old.length).fill(null)];
        for (let i = 0; i < this.n; i++) this.total++;
        this.snap(`把 ${this.n} 個元素複製到新陣列（O(n)，但很少發生）`, 3, { old, c: Object.fromEntries(Array.from({ length: this.n }, (_, i) => [i, 'swap'])) });
      }
      this.a[this.n++] = v;
      this.total++;
      this.snap(`push ${v}`, 4, { c: { [this.n - 1]: 'done' } });
    } else if (op === 'pop') {
      if (!this.n) { this.snap('陣列為空'); return; }
      const v = this.a[--this.n];
      this.a[this.n] = null;
      this.snap(`pop → ${v}`, 6, { c: { [this.n]: 'bad' } });
      if (this.cap > 2 && this.n <= this.cap / 4) {
        this.cap /= 2;
        this.a = this.a.slice(0, this.cap);
        this.snap(`長度降到容量的 1/4，縮小容量為 ${this.cap}（避免反覆擴縮造成的抖動）`, 7);
      }
    } else if (op === 'pushMany') {
      for (let k = 0; k < 6; k++) this.run('push', rv());
    }
  }
}

const dynArray: DSDef = {
  id: 'ds-dynamic-array', name: '動態陣列', en: 'Dynamic Array (Vector / ArrayList)', cat, star: true,
  desc: '容量不足時配置兩倍大小的新陣列並把資料複製過去。單次擴容是 O(n)，但平均到每次 push 只有 O(1)（均攤分析：1 + 2 + 4 + … + n < 2n）。長度降到 1/4 時縮容。',
  complexity: [['存取', 'O(1)'], ['push（尾端加入）', '均攤 O(1)'], ['pop（尾端移除）', '均攤 O(1)'], ['中間插入／刪除', 'O(n)']],
  codes: { push: ['push(v):', '  if n == cap:', '    newArr = 配置 2·cap', '    複製舊元素；cap *= 2', '  a[n++] = v'], pop: ['', '', '', '', '', 'pop(): v = a[--n]', '  if n <= cap/4: cap /= 2（縮容）'] },
  ops: [
    { key: 'push', label: 'push', arg: 'number', rand: rv },
    { key: 'pop', label: 'pop', arg: 'none' },
    { key: 'pushMany', label: '連續 push 6 次', arg: 'none' },
  ],
  create: () => new DynArray(),
};

// ---------------- 鏈結串列 ----------------

type LH = { c?: CM; labels?: Record<string, number | null>; ec?: CM };

class LinkedDS extends DSBase<LH> {
  L: LL = { val: {}, next: {}, pos: {} };
  head: number | null = null;
  tail: number | null = null;
  id = 0;
  constructor(public kind: 'single' | 'double' | 'circular') {
    super();
    if (kind === 'double') this.L.prev = {};
  }
  order() {
    const o: number[] = [];
    for (let c = this.head; c !== null && o.length < 200; c = this.L.next[c]) { o.push(c); if (this.kind === 'circular' && this.L.next[c] === this.head) break; }
    return o;
  }
  relayout() {
    Object.assign(this.L.pos, rowPos(this.order()));
  }
  panels(h: LH = {}): Panel[] {
    const o = this.order();
    return [listPanel(this.L, { colors: h.c, labels: { head: this.head, ...(this.kind !== 'circular' ? { tail: this.tail } : {}), ...h.labels }, edgeColors: h.ec, showNull: this.kind !== 'circular', title: this.kind === 'double' ? '雙向鏈結串列（虛線為 prev 指標）' : this.kind === 'circular' ? '環狀鏈結串列（尾端指回 head）' : '單向鏈結串列' }), vars({ 長度: o.length })];
  }
  newNode(v: number) {
    const id = this.id++;
    this.L.val[id] = v;
    this.L.next[id] = null;
    if (this.L.prev) this.L.prev[id] = null;
    return id;
  }
  run(op: string, a?: any, b?: any) {
    const L = this.L;
    const circ = this.kind === 'circular';
    if (op === 'fill') { for (const v of rnd.arr(5)) this.run('pushBack', v); this.r.frames = []; this.snap('隨機建立串列'); return; }
    if (op === 'pushFront') {
      const v = num(a, rv());
      const nd = this.newNode(v);
      L.pos[nd] = { x: (this.head !== null ? L.pos[this.head].x : 0) - GAP, y: 60 };
      this.snap(`建立新節點 ${v}`, 1, { c: { [nd]: 'swap' }, labels: { node: nd } });
      L.next[nd] = this.head;
      if (L.prev && this.head !== null) L.prev[this.head] = nd;
      this.snap('node.next = head', 2, { c: { [nd]: 'swap' }, labels: { node: nd }, ec: { [nd]: 'swap' } });
      if (circ) {
        if (this.head === null) L.next[nd] = nd;
        else { const last = this.order().slice(-1)[0]; L.next[last] = nd; this.snap('尾端節點改指向新 head（維持環狀）', 2, { c: { [nd]: 'swap', [last]: 'active' }, ec: { [last]: 'swap' } }); }
      }
      this.head = nd;
      if (this.tail === null) this.tail = nd;
      this.relayout();
      this.snap(`head = node，頭端插入完成（O(1)）`, 3, { c: { [nd]: 'done' } });
      return;
    }
    if (op === 'pushBack') {
      const v = num(a, rv());
      const nd = this.newNode(v);
      if (this.head === null) { this.head = this.tail = nd; if (circ) L.next[nd] = nd; this.relayout(); this.snap(`串列為空，${v} 成為 head`, 1, { c: { [nd]: 'done' } }); return; }
      // 有維護 tail 指標，所以不需要從 head 走到尾端
      const cur = this.tail!;
      L.pos[nd] = { x: L.pos[cur].x + GAP, y: 60 };
      this.snap(`透過 tail 指標直接找到尾端 ${L.val[cur]}`, 4, { c: { [cur]: 'active', [nd]: 'swap' }, labels: { node: nd } });
      L.next[cur] = nd;
      if (L.prev) L.prev[nd] = cur;
      if (circ) L.next[nd] = this.head;
      this.tail = nd;
      this.relayout();
      this.snap(`tail.next = node；tail = node${circ ? '；node.next = head' : ''}`, 5, { c: { [nd]: 'done' }, ec: { [cur]: 'swap' } });
      return;
    }
    if (op === 'insertAt') {
      const i = num(a), v = num(b, rv());
      const o = this.order();
      if (i <= 0 || this.head === null) { this.run('pushFront', v); return; }
      if (i >= o.length) { this.run('pushBack', v); return; }
      let prev = this.head;
      this.snap('從 head 出發', 6, { c: { [prev]: 'active' }, labels: { prev } });
      for (let k = 1; k < i; k++) { prev = L.next[prev]!; this.snap(`prev 前進到第 ${k} 個`, 6, { c: { [prev]: 'active' }, labels: { prev } }); }
      const nd = this.newNode(v);
      L.pos[nd] = { x: L.pos[prev].x + GAP / 2, y: 70 };
      L.next[nd] = L.next[prev];
      if (L.prev) { L.prev[nd] = prev; L.prev[L.next[prev]!] = nd; }
      this.snap('node.next = prev.next', 7, { c: { [prev]: 'active', [nd]: 'swap' }, labels: { prev, node: nd }, ec: { [nd]: 'swap' } });
      L.next[prev] = nd;
      this.snap('prev.next = node', 8, { c: { [nd]: 'swap' }, labels: { prev, node: nd }, ec: { [prev]: 'swap' } });
      this.relayout();
      this.snap(`在位置 ${i} 插入 ${v} 完成`, 8, { c: { [nd]: 'done' } });
      return;
    }
    if (op === 'delete') {
      const v = num(a);
      if (this.head === null) { this.snap('串列為空'); return; }
      let prev: number | null = null, cur: number | null = this.head;
      const o = this.order();
      for (let k = 0; k < o.length; k++) {
        this.snap(`比較 ${L.val[cur!]}`, 9, { c: { [cur!]: 'compare' }, labels: { prev, cur } });
        if (L.val[cur!] === v) break;
        prev = cur; cur = L.next[cur!];
        if (k === o.length - 1) cur = null;
      }
      if (cur === null) { this.snap(`找不到 ${v}`, 9); return; }
      const nx = L.next[cur];
      this.snap(`找到 ${v}，準備移除`, 10, { c: { [cur]: 'bad' }, labels: { prev, cur } });
      if (prev === null) {
        if (circ) { if (nx === cur) this.head = null; else { const last = o[o.length - 1]; L.next[last] = nx; this.head = nx; } }
        else this.head = nx;
      } else L.next[prev] = circ && nx === this.head ? this.head : nx;
      if (L.prev && nx !== null && nx !== undefined) L.prev[nx] = prev;
      if (cur === this.tail) this.tail = circ ? (prev ?? null) : prev;
      if (circ && this.head === null) this.tail = null;
      L.pos[cur] = { ...L.pos[cur], y: 70 };
      this.snap(prev === null ? 'head 指向下一個節點' : 'prev.next = cur.next', 11, { c: { [cur]: 'muted' }, labels: { prev }, ec: prev !== null ? { [prev]: 'swap' } : {} });
      delete L.val[cur]; delete L.next[cur]; if (L.prev) delete L.prev[cur];
      this.relayout();
      this.snap(`刪除 ${v} 完成`, 11);
      return;
    }
    if (op === 'search') {
      const v = num(a);
      const o = this.order();
      for (const c of o) {
        this.snap(`比較 ${L.val[c]}`, 9, { c: { [c]: 'compare' }, labels: { cur: c } });
        if (L.val[c] === v) { this.snap(`找到 ${v}`, 9, { c: { [c]: 'done' }, labels: { cur: c } }); return; }
      }
      this.snap(`找不到 ${v}（需要 O(n) 逐一走訪）`, 9);
      return;
    }
    if (op === 'backward') {
      const o = this.order();
      for (let k = o.length - 1; k >= 0; k--) this.snap(`沿 prev 指標反向走訪：${L.val[o[k]]}`, undefined, { c: { [o[k]]: 'active' }, labels: { cur: o[k] } });
      this.snap('反向走訪完成（雙向串列才能 O(1) 往回走）');
      return;
    }
    if (op === 'traverse') {
      const o = this.order();
      for (let k = 0; k < o.length * 2; k++) this.snap(`第 ${k + 1} 步：${L.val[o[k % o.length]]}${k === o.length ? '（回到 head，繞了一圈）' : ''}`, undefined, { c: { [o[k % o.length]]: 'active' }, labels: { cur: o[k % o.length] } });
      this.snap('環狀串列可以無限繞圈，常用於輪流排程（round-robin）');
    }
  }
}

const llCodes = {
  pushFront: ['pushFront(v): node = new Node(v)', '  node.next = head', '  head = node'],
  pushBack: ['', '', '', 'pushBack(v): 由 tail 找到尾端', '  tail.next = node; tail = node'],
  insertAt: ['', '', '', '', '', 'insertAt(i, v): prev = 第 i-1 個節點', '  node.next = prev.next', '  prev.next = node'],
  delete: ['', '', '', '', '', '', '', '', 'delete(v): 走訪找到 cur（記住 prev）', '  找到後：', '  prev.next = cur.next'],
  search: ['', '', '', '', '', '', '', '', 'search(v): 從 head 逐一比較'],
};

const sll: DSDef = {
  id: 'ds-singly-linked-list', name: '單向鏈結串列', en: 'Singly Linked List', cat, star: true,
  desc: '每個節點存放資料與指向下一個節點的指標。插入、刪除只要改指標（已知位置時 O(1)），但無法隨機存取，找第 i 個元素需從 head 走起。',
  complexity: [['存取第 i 個', 'O(n)'], ['頭端插入／刪除', 'O(1)'], ['尾端插入（有 tail）', 'O(1)'], ['搜尋', 'O(n)']],
  codes: llCodes,
  ops: [
    { key: 'pushFront', label: '頭端插入', arg: 'number', rand: rv },
    { key: 'pushBack', label: '尾端插入', arg: 'number', rand: rv },
    { key: 'insertAt', label: '插入(i, v)', arg: 'two', argLabel: 'i v', rand: () => [rnd.int(1, 4), rv()] },
    { key: 'delete', label: '刪除值', arg: 'number', rand: rv },
    { key: 'search', label: '搜尋', arg: 'number', rand: rv },
  ],
  create: () => new LinkedDS('single'),
  init: [['fill']],
};

const dll: DSDef = {
  id: 'ds-doubly-linked-list', name: '雙向鏈結串列', en: 'Doubly Linked List', cat, star: true,
  desc: '每個節點同時有 next 與 prev 指標，可以雙向走訪；已知節點時可 O(1) 刪除（不需要找前一個節點）。代價是每個節點多一個指標的空間。LRU 快取常用它搭配雜湊表。',
  complexity: [['存取第 i 個', 'O(n)'], ['兩端插入／刪除', 'O(1)'], ['刪除已知節點', 'O(1)'], ['搜尋', 'O(n)']],
  codes: llCodes,
  ops: [
    { key: 'pushFront', label: '頭端插入', arg: 'number', rand: rv },
    { key: 'pushBack', label: '尾端插入', arg: 'number', rand: rv },
    { key: 'insertAt', label: '插入(i, v)', arg: 'two', argLabel: 'i v', rand: () => [rnd.int(1, 4), rv()] },
    { key: 'delete', label: '刪除值', arg: 'number', rand: rv },
    { key: 'backward', label: '反向走訪', arg: 'none' },
  ],
  create: () => new LinkedDS('double'),
  init: [['fill']],
};

const cll: DSDef = {
  id: 'ds-circular-linked-list', name: '環狀鏈結串列', en: 'Circular Linked List', cat,
  desc: '最後一個節點的 next 指回 head，形成一個環。從任一節點出發都能走遍整個串列，適合輪流排程、循環緩衝等需要「繞圈」的情境。',
  complexity: [['頭／尾插入（有 tail）', 'O(1)'], ['刪除', 'O(n)'], ['走訪一圈', 'O(n)']],
  codes: llCodes,
  ops: [
    { key: 'pushFront', label: '頭端插入', arg: 'number', rand: rv },
    { key: 'pushBack', label: '尾端插入', arg: 'number', rand: rv },
    { key: 'delete', label: '刪除值', arg: 'number', rand: rv },
    { key: 'traverse', label: '繞圈走訪', arg: 'none' },
  ],
  create: () => new LinkedDS('circular'),
  init: [['fill']],
};

// ---------------- 堆疊與佇列 ----------------

class StackDS extends DSBase<CM> {
  s: number[] = [];
  cap = 10;
  panels(c: CM = {}): Panel[] {
    const rows = Array.from({ length: this.cap }, (_, i) => [this.s[this.cap - 1 - i] ?? '']);
    const col: Record<string, Color | undefined> = {};
    for (let i = 0; i < this.cap; i++) { const k = this.cap - 1 - i; if (k >= this.s.length) col[`${i},0`] = 'muted'; if (c[k]) col[`${i},0`] = c[k]; }
    return [{ type: 'table', rows, colors: col, rowHeaders: rows.map((_, i) => (this.cap - 1 - i === this.s.length - 1 ? 'top →' : String(this.cap - 1 - i))), title: '堆疊（LIFO：後進先出）', w: 'auto' }, vars({ 大小: this.s.length, top: this.s[this.s.length - 1] ?? '空' })];
  }
  run(op: string, a?: any) {
    if (op === 'push') {
      if (this.s.length >= this.cap) { this.snap('堆疊已滿（stack overflow）', 1); return; }
      this.s.push(num(a, rv()));
      this.snap(`push ${this.s[this.s.length - 1]}：放到頂端`, 1, { [this.s.length - 1]: 'swap' });
    } else if (op === 'pop') {
      if (!this.s.length) { this.snap('堆疊為空（stack underflow）', 2); return; }
      this.snap(`pop：取出頂端 ${this.s[this.s.length - 1]}`, 2, { [this.s.length - 1]: 'bad' });
      this.s.pop();
      this.snap('已移除', 2);
    } else if (op === 'peek') this.snap(this.s.length ? `peek：頂端為 ${this.s[this.s.length - 1]}（不移除）` : '堆疊為空', 3, { [this.s.length - 1]: 'done' });
  }
}

const stackDS: DSDef = {
  id: 'ds-stack', name: '堆疊', en: 'Stack', cat, star: true,
  desc: '只能在同一端（頂端）放入與取出的容器：後進先出（LIFO）。用於函式呼叫堆疊、復原（Undo）、括號匹配、DFS、運算式求值等。',
  complexity: [['push', 'O(1)'], ['pop', 'O(1)'], ['peek', 'O(1)']],
  codes: { push: ['push(x): a[top++] = x'], pop: ['', 'pop(): return a[--top]'], peek: ['', '', 'peek(): return a[top-1]'] },
  ops: [
    { key: 'push', label: 'push', arg: 'number', rand: rv },
    { key: 'pop', label: 'pop', arg: 'none' },
    { key: 'peek', label: 'peek', arg: 'none' },
  ],
  create: () => new StackDS(),
  init: [['push', 12], ['push', 7], ['push', 33]],
};

class QueueDS extends DSBase<CM> {
  q: number[] = [];
  panels(c: CM = {}): Panel[] {
    const p = this.q.length ? [{ index: 0, label: 'front' }, { index: this.q.length - 1, label: 'rear' }] : [];
    return [cells(this.q.length ? this.q : [''], this.q.length ? c : {}, { title: '佇列（FIFO：先進先出，左出右進）', pointers: p }), vars({ 大小: this.q.length })];
  }
  run(op: string, a?: any) {
    if (op === 'enqueue') { this.q.push(num(a, rv())); this.snap(`enqueue ${this.q[this.q.length - 1]}：加到尾端`, 1, { [this.q.length - 1]: 'swap' }); }
    else if (op === 'dequeue') {
      if (!this.q.length) { this.snap('佇列為空', 2); return; }
      this.snap(`dequeue：取出前端 ${this.q[0]}`, 2, { 0: 'bad' });
      this.q.shift();
      this.snap('已移除', 2);
    } else if (op === 'front') this.snap(this.q.length ? `front = ${this.q[0]}` : '佇列為空', 3, { 0: 'done' });
  }
}

const queueDS: DSDef = {
  id: 'ds-queue', name: '佇列', en: 'Queue', cat, star: true,
  desc: '從尾端加入、從前端取出：先進先出（FIFO）。用於排隊、工作排程、BFS、緩衝區等。以鏈結串列或環狀陣列實作皆可 O(1)。',
  complexity: [['enqueue', 'O(1)'], ['dequeue', 'O(1)'], ['front', 'O(1)']],
  codes: { enqueue: ['enqueue(x): rear.next = x; rear = x'], dequeue: ['', 'dequeue(): x = front; front = front.next'], front: ['', '', 'front(): return front.val'] },
  ops: [
    { key: 'enqueue', label: 'enqueue', arg: 'number', rand: rv },
    { key: 'dequeue', label: 'dequeue', arg: 'none' },
    { key: 'front', label: 'front', arg: 'none' },
  ],
  create: () => new QueueDS(),
  init: [['enqueue', 5], ['enqueue', 18], ['enqueue', 42]],
};

class CircularQ extends DSBase<CM> {
  cap = 8;
  a: (number | null)[] = new Array(8).fill(null);
  front = 0;
  size = 0;
  get rear() {
    return (this.front + this.size) % this.cap;
  }
  panels(c: CM = {}): Panel[] {
    const col: CM = {};
    for (let i = 0; i < this.cap; i++) col[i] = this.a[i] === null ? 'muted' : undefined;
    const n = this.cap, R = 90;
    const nodes = this.a.map((v, i) => ({ id: 'c' + i, x: R * Math.cos((2 * Math.PI * i) / n - Math.PI / 2), y: R * Math.sin((2 * Math.PI * i) / n - Math.PI / 2), label: v === null ? '' : String(v), sub: String(i), color: c[i] ?? (v === null ? 'muted' as Color : 'active' as Color), badge: [i === this.front ? 'front' : '', i === this.rear && this.size < this.cap ? 'rear' : ''].filter(Boolean).join(',') || undefined }));
    const edges = nodes.map((_, i) => ({ from: 'c' + i, to: 'c' + ((i + 1) % n), directed: true, color: 'muted' as Color }));
    return [{ type: 'graph', nodes, edges, title: '環狀佇列（環狀緩衝區）', w: 'half' }, cells(this.a, { ...col, ...c }, { title: '底層陣列', pointers: [{ index: this.front, label: 'front' }, ...(this.size < this.cap ? [{ index: this.rear, label: 'rear' }] : [])], w: 'half' }), vars({ 大小: this.size, 容量: this.cap })];
  }
  run(op: string, a?: any) {
    if (op === 'enqueue') {
      if (this.size === this.cap) { this.snap('佇列已滿（size == cap）', 1, Object.fromEntries(this.a.map((_, i) => [i, 'bad']))); return; }
      const r = this.rear;
      this.a[r] = num(a, rv());
      this.size++;
      this.snap(`a[rear = ${r}] = ${this.a[r]}；rear = (rear + 1) mod ${this.cap}`, 2, { [r]: 'swap' });
    } else if (op === 'dequeue') {
      if (!this.size) { this.snap('佇列為空', 3); return; }
      const f = this.front;
      this.snap(`取出 a[front = ${f}] = ${this.a[f]}`, 3, { [f]: 'bad' });
      this.a[f] = null;
      this.front = (this.front + 1) % this.cap;
      this.size--;
      this.snap(`front = (front + 1) mod ${this.cap} = ${this.front}`, 4);
    }
  }
}

const circularQ: DSDef = {
  id: 'ds-circular-queue', name: '環狀佇列', en: 'Circular Queue (Ring Buffer)', cat,
  desc: '用固定大小的陣列實作佇列：front 與 rear 指標到達尾端時用 mod 繞回開頭，重複利用已出隊的空間，不需要搬移元素。常見於 I/O 緩衝與串流處理。',
  complexity: [['enqueue', 'O(1)'], ['dequeue', 'O(1)'], ['空間', 'O(容量)']],
  codes: { enqueue: ['if size == cap: 已滿', 'a[(front + size) mod cap] = x; size++'], dequeue: ['', '', 'x = a[front]', 'front = (front + 1) mod cap; size--'] },
  ops: [
    { key: 'enqueue', label: 'enqueue', arg: 'number', rand: rv },
    { key: 'dequeue', label: 'dequeue', arg: 'none' },
  ],
  create: () => new CircularQ(),
  init: [['enqueue', 3], ['enqueue', 14], ['enqueue', 15], ['dequeue'], ['enqueue', 92], ['enqueue', 65]],
};

class DequeDS extends DSBase<CM> {
  d: number[] = [];
  panels(c: CM = {}): Panel[] {
    return [cells(this.d.length ? this.d : [''], this.d.length ? c : {}, { title: '雙端佇列（兩端皆可進出）', pointers: this.d.length ? [{ index: 0, label: 'front' }, { index: this.d.length - 1, label: 'back' }] : [] }), vars({ 大小: this.d.length })];
  }
  run(op: string, a?: any) {
    const v = num(a, rv());
    if (op === 'pushFront') { this.d.unshift(v); this.snap(`pushFront ${v}`, 1, { 0: 'swap' }); }
    else if (op === 'pushBack') { this.d.push(v); this.snap(`pushBack ${v}`, 2, { [this.d.length - 1]: 'swap' }); }
    else if (!this.d.length) this.snap('雙端佇列為空');
    else if (op === 'popFront') { this.snap(`popFront → ${this.d[0]}`, 3, { 0: 'bad' }); this.d.shift(); this.snap('已移除', 3); }
    else if (op === 'popBack') { this.snap(`popBack → ${this.d[this.d.length - 1]}`, 4, { [this.d.length - 1]: 'bad' }); this.d.pop(); this.snap('已移除', 4); }
  }
}

const dequeDS: DSDef = {
  id: 'ds-deque', name: '雙端佇列', en: 'Deque (Double-Ended Queue)', cat,
  desc: '前後兩端都能 O(1) 加入與移除，同時具備堆疊與佇列的能力。常用於滑動視窗最大值、0-1 BFS、工作竊取排程。通常以環狀陣列或雙向鏈結串列實作。',
  complexity: [['pushFront / pushBack', 'O(1)'], ['popFront / popBack', 'O(1)']],
  codes: { pushFront: ['pushFront(x)'], pushBack: ['', 'pushBack(x)'], popFront: ['', '', 'popFront()'], popBack: ['', '', '', 'popBack()'] },
  ops: [
    { key: 'pushFront', label: 'pushFront', arg: 'number', rand: rv },
    { key: 'pushBack', label: 'pushBack', arg: 'number', rand: rv },
    { key: 'popFront', label: 'popFront', arg: 'none' },
    { key: 'popBack', label: 'popBack', arg: 'none' },
  ],
  create: () => new DequeDS(),
  init: [['pushBack', 10], ['pushBack', 20], ['pushFront', 5]],
};

export default [arrayDS, dynArray, sll, dll, cll, stackDS, queueDS, circularQ, dequeDS];
