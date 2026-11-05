// 機率型資料結構與快取：布隆過濾器、計數布隆、Count–Min、HyperLogLog、LRU、LFU
import type { Color, DSDef, GEdge, GNode, Panel } from '../core/types';
import { bars, cells, rnd, table, text, vars } from '../core/helpers';
import { DSBase, num } from './base';

/** 多項式字串雜湊（與各語言實作相同） */
export const polyHash = (s: string, base: number, mod: number) => {
  let h = 0;
  for (const ch of s) h = (h * base + ch.charCodeAt(0)) % mod;
  return h;
};
/** k 個雜湊函數：h_i = (h1 + i·h2) mod m（雙重雜湊） */
export const kHashes = (s: string, k: number, m: number) => {
  const h1 = polyHash(s, 31, 1000000007), h2 = polyHash(s, 37, 998244353) | 1;
  return Array.from({ length: k }, (_, i) => (h1 + i * h2) % m);
};
const WORDS = ['apple', 'banana', 'cherry', 'grape', 'lemon', 'mango', 'melon', 'peach', 'pear', 'plum', 'kiwi', 'lime', 'fig', 'date', 'berry', 'olive'];
const word = () => rnd.pick(WORDS);
const key = (a: any) => String(a ?? '').trim();

// ---------------- 布隆過濾器 ----------------
class Bloom extends DSBase<{ bits?: Record<number, Color>; msg?: string }> {
  m = 32;
  k = 3;
  bits = new Array(32).fill(0);
  items: string[] = [];
  panels(h: { bits?: Record<number, Color> } = {}): Panel[] {
    const n = this.items.length;
    const fp = (1 - Math.exp((-this.k * n) / this.m)) ** this.k;
    return [cells(this.bits, h.bits ?? Object.fromEntries(this.bits.map((b, i) => [i, b ? 'active' : undefined])), { title: `位元陣列（m = ${this.m}，k = ${this.k} 個雜湊）` }), text([this.items.join(', ') || '（空）'], '已插入（只為了對照，真實的布隆過濾器不保存元素）'), vars({ n, 為1的位元: this.bits.filter(Boolean).length, 理論誤判率: `${(fp * 100).toFixed(1)}%` })];
  }
  run(op: string, a?: any) {
    const s = key(a);
    if (op === 'clear') { this.bits.fill(0); this.items = []; this.snap('清空'); return; }
    if (!s) { this.snap('請輸入字串'); return; }
    const hs = kHashes(s, this.k, this.m);
    const hl = (c: Color) => Object.fromEntries([...this.bits.map((b, i) => [i, b ? 'visited' : undefined]), ...hs.map((i) => [i, c])]);
    if (op === 'insert') {
      this.snap(`「${s}」的 ${this.k} 個雜湊位置：${hs.join(', ')}`, 1, { bits: hl('compare') });
      hs.forEach((i) => (this.bits[i] = 1));
      if (!this.items.includes(s)) this.items.push(s);
      this.snap('把這些位元設為 1（已經是 1 的保持不變）', 2, { bits: hl('swap') });
    } else if (op === 'query') {
      this.snap(`檢查「${s}」的位置 ${hs.join(', ')}`, 1, { bits: hl('compare') });
      const zero = hs.filter((i) => !this.bits[i]);
      if (zero.length) this.snap(`位元 ${zero.join(', ')} 是 0：「${s}」確定不存在`, 3, { bits: Object.fromEntries(hs.map((i) => [i, this.bits[i] ? 'good' : 'bad'])) });
      else {
        const really = this.items.includes(s);
        this.snap(`三個位元都是 1：「${s}」可能存在` + (really ? '（確實插入過）' : '（其實沒插入過：這是誤判 false positive）'), 4, { bits: Object.fromEntries(hs.map((i) => [i, really ? 'done' : 'special'])) });
      }
    } else if (op === 'delete') {
      const shared = hs.filter((i) => this.items.some((w) => w !== s && kHashes(w, this.k, this.m).includes(i)));
      this.snap(`標準布隆過濾器不能刪除：把「${s}」的位元清 0 會影響共用這些位元的其他元素` + (shared.length ? `（位元 ${shared.join(', ')} 也被別的元素使用）` : '') + '。需要刪除請改用計數布隆過濾器', 5, { bits: Object.fromEntries(hs.map((i) => [i, shared.includes(i) ? 'bad' : 'compare'])) });
    }
  }
}
const bloom: DSDef = {
  id: 'bloom-filter', name: '布隆過濾器', en: 'Bloom Filter', cat: 'ds-prob', star: true,
  desc: '用 m 個位元與 k 個雜湊函數表示集合。插入時把 k 個位置設為 1；查詢時只要有一個位置是 0 就「確定不存在」，全部是 1 只能說「可能存在」（可能是別的元素湊出來的誤判）。空間極省，不會漏判但會誤判，且標準版不能刪除。',
  complexity: [['插入／查詢', 'O(k)'], ['空間', 'm 位元'], ['誤判率', '≈ (1 − e^(−kn/m))^k']],
  codes: { insert: ['for i in 0..k-1: p = h_i(x) mod m', '  bits[p] = 1'], query: ['for i in 0..k-1: p = h_i(x) mod m', '', '  if bits[p] == 0: return 確定不存在', 'return 可能存在'], delete: ['', '', '', '', '不支援：清除位元會讓其他元素被漏判'] },
  ops: [
    { key: 'insert', label: '插入', arg: 'text', argLabel: '字串', rand: word },
    { key: 'query', label: '查詢', arg: 'text', argLabel: '字串', rand: word },
    { key: 'delete', label: '嘗試刪除', arg: 'text', argLabel: '字串', rand: word },
    { key: 'clear', label: '清空', arg: 'none' },
  ],
  create: () => new Bloom(),
  init: [['insert', 'apple'], ['insert', 'banana'], ['insert', 'cherry'], ['insert', 'grape']],
};

// ---------------- 計數布隆過濾器 ----------------
class CountingBloom extends DSBase<Record<number, Color>> {
  m = 16;
  k = 3;
  MAX = 15;
  c = new Array(16).fill(0);
  items: string[] = [];
  panels(h?: Record<number, Color>): Panel[] {
    return [bars(this.c, h ?? Object.fromEntries(this.c.map((v, i) => [i, v ? (v >= this.MAX ? 'bad' : 'active') : undefined])), { title: `計數器（4 位元，上限 ${this.MAX}，紅色表示已飽和）`, height: 120 }), text([this.items.join(', ') || '（空）'], '已插入（對照用）')];
  }
  run(op: string, a?: any) {
    const s = key(a);
    if (!s) { this.snap('請輸入字串'); return; }
    const hs = kHashes(s, this.k, this.m);
    const hl = (col: Color) => Object.fromEntries(hs.map((i) => [i, col]));
    if (op === 'insert') {
      this.snap(`「${s}」的位置：${hs.join(', ')}`, 1, hl('compare'));
      hs.forEach((i) => { if (this.c[i] < this.MAX) this.c[i]++; });
      this.items.push(s);
      this.snap('各計數器 +1（已達上限 15 就停在 15，避免溢位繞回 0）', 2, hl('swap'));
    } else if (op === 'query') {
      const ok = hs.every((i) => this.c[i] > 0);
      this.snap(ok ? `計數器都 > 0：「${s}」可能存在` : `有計數器為 0：「${s}」確定不存在`, ok ? 4 : 3, Object.fromEntries(hs.map((i) => [i, this.c[i] ? 'good' : 'bad'])));
    } else if (op === 'delete') {
      if (hs.some((i) => this.c[i] === 0)) { this.snap(`「${s}」確定不存在，拒絕刪除（否則計數器會變成負數）`, 5, hl('bad')); return; }
      if (!this.items.includes(s)) this.snap(`警告：「${s}」看起來可能存在但其實沒插入過，刪除會讓別的元素被漏判；只應刪除確定插入過的元素`, 5, hl('special'));
      hs.forEach((i) => { if (this.c[i] < this.MAX) this.c[i]--; });
      const at = this.items.indexOf(s);
      if (at >= 0) this.items.splice(at, 1);
      this.snap('各計數器 −1（已飽和的計數器不再減，因為無法得知真實次數）', 6, hl('swap'));
    }
  }
}
const countingBloom: DSDef = {
  id: 'counting-bloom', name: '計數布隆過濾器', en: 'Counting Bloom Filter', cat: 'ds-prob',
  desc: '把布隆過濾器的每個位元換成小計數器：插入時 +1、刪除時 −1，因此支援刪除。只能刪除確定插入過的元素；計數器有上限（這裡 4 位元 = 15），飽和後就不再增減，以免溢位造成漏判。',
  complexity: [['插入／查詢／刪除', 'O(k)'], ['空間', 'm 個計數器']],
  codes: { insert: ['for p in h_1..h_k(x):', '  if cnt[p] < 15: cnt[p] += 1'], query: ['', '', '', 'if 任一 cnt[p] == 0: 確定不存在', '否則：可能存在'], delete: ['', '', '', '', '', '若確定不存在則拒絕', '否則 for p: if cnt[p] < 15: cnt[p] −= 1'] },
  ops: [
    { key: 'insert', label: '插入', arg: 'text', argLabel: '字串', rand: word },
    { key: 'query', label: '查詢', arg: 'text', argLabel: '字串', rand: word },
    { key: 'delete', label: '刪除', arg: 'text', argLabel: '字串', rand: word },
  ],
  create: () => new CountingBloom(),
  init: [['insert', 'apple'], ['insert', 'banana'], ['insert', 'cherry']],
};

// ---------------- Count–Min Sketch ----------------
class CountMin extends DSBase<Record<string, Color>> {
  d = 3;
  w = 8;
  t = Array.from({ length: 3 }, () => new Array(8).fill(0));
  truth = new Map<string, number>();
  idx(s: string) { return kHashes(s, this.d, this.w); }
  panels(h: Record<string, Color> = {}): Panel[] {
    return [table(this.t, h, { rowHeaders: this.t.map((_, i) => `h${i}`), colHeaders: this.t[0].map((_, j) => j), title: `計數表（d = ${this.d} 列 × w = ${this.w} 欄）` }), table([...this.truth.entries()].map(([k, v]) => [k, v, Math.min(...this.idx(k).map((j, i) => this.t[i][j]))]), {}, { colHeaders: ['元素', '真實次數', '估計'], title: '對照（真實結構不保存元素）', w: 'half' })];
  }
  run(op: string, a?: any) {
    const parts = key(a).split(/\s+/);
    const s = parts[0];
    if (!s) { this.snap('請輸入字串'); return; }
    const js = this.idx(s);
    const hl = (c: Color) => Object.fromEntries(js.map((j, i) => [`${i},${j}`, c]));
    if (op === 'update') {
      const c = Math.max(1, Math.floor(num(parts[1], 1)));
      js.forEach((j, i) => (this.t[i][j] += c));
      this.truth.set(s, (this.truth.get(s) ?? 0) + c);
      this.snap(`「${s}」+${c}：每一列在 h_i(${s}) 的欄位加 ${c}`, 1, hl('swap'));
    } else {
      const vals = js.map((j, i) => this.t[i][j]);
      const est = Math.min(...vals), real = this.truth.get(s) ?? 0;
      this.snap(`各列的計數為 ${vals.join(', ')}，取最小值 ${est}（真實 ${real}；碰撞只會讓估計偏大，不會偏小）`, 2, Object.fromEntries(js.map((j, i) => [`${i},${j}`, vals[i] === est ? 'done' : 'compare'])));
    }
  }
}
const countMin: DSDef = {
  id: 'count-min-sketch', name: 'Count–Min 頻率估計', en: 'Count–Min Sketch', cat: 'ds-prob',
  desc: '用 d 列、每列 w 個計數器估計資料流中每個元素出現幾次。更新時每列各用一個雜湊函數選一欄加一；查詢時取 d 個計數的最小值。在只有非負更新時，估計值一定 ≥ 真實次數，誤差隨 w 增大而變小，空間與元素種類數無關。',
  complexity: [['更新／查詢', 'O(d)'], ['空間', 'O(d·w)'], ['誤差', '≤ εN（機率 1 − δ，w = e/ε，d = ln(1/δ)）']],
  codes: { update: ['for i in 0..d-1: C[i][h_i(x)] += c'], query: ['', '', 'return min_i C[i][h_i(x)]'] },
  ops: [
    { key: 'update', label: '更新（元素 次數）', arg: 'text', argLabel: '元素 [次數]', rand: () => `${word()} ${rnd.int(1, 4)}` },
    { key: 'query', label: '查詢', arg: 'text', argLabel: '元素', rand: word },
  ],
  create: () => new CountMin(),
  init: [['update', 'apple 5'], ['update', 'banana 2'], ['update', 'cherry 3'], ['update', 'grape 1'], ['update', 'lemon 4']],
};

// ---------------- HyperLogLog ----------------
export const fmix32 = (h: number) => {
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
};
export const hll32 = (s: string) => fmix32(polyHash(s, 31, 4294967291));
class HLL extends DSBase<Record<number, Color>> {
  p = 4;
  m = 16;
  M = new Array(16).fill(0);
  seen = new Set<string>();
  counter = 0;
  estimate() {
    const alpha = 0.673;
    const Z = this.M.reduce((s, r) => s + 2 ** -r, 0);
    let E = (alpha * this.m * this.m) / Z;
    const V = this.M.filter((r) => r === 0).length;
    if (E <= 2.5 * this.m && V > 0) E = this.m * Math.log(this.m / V);
    return E;
  }
  panels(h?: Record<number, Color>): Panel[] {
    const E = this.estimate();
    return [bars(this.M, h ?? {}, { title: `暫存器 M[0..${this.m - 1}]：每格記錄看過的最大「前導零個數 + 1」`, height: 120 }), vars({ 真實相異數: this.seen.size, 估計: E.toFixed(1), 相對誤差: this.seen.size ? `${(((E - this.seen.size) / this.seen.size) * 100).toFixed(1)}%` : '—', 理論標準誤差: `±${((1.04 / Math.sqrt(this.m)) * 100).toFixed(0)}%` })];
  }
  add(s: string, show: boolean) {
    const x = hll32(s);
    const j = x >>> (32 - this.p);
    const w = (x << this.p) >>> 0;
    const rho = Math.min(32 - this.p + 1, Math.clz32(w) + 1);
    const old = this.M[j];
    this.M[j] = Math.max(old, rho);
    this.seen.add(s);
    if (show) {
      const bits = x.toString(2).padStart(32, '0');
      this.snap(`「${s}」雜湊 = ${bits.slice(0, this.p)}|${bits.slice(this.p)}：前 ${this.p} 位選暫存器 ${j}，其餘前導零 ${rho - 1} 個 → ρ = ${rho}` + (rho > old ? `，更新 M[${j}] = ${rho}` : `，M[${j}] = ${old} 不變`), 2, { [j]: rho > old ? 'swap' : 'compare' });
    }
  }
  run(op: string, a?: any) {
    if (op === 'add') { const s = key(a); if (!s) { this.snap('請輸入字串'); return; } this.add(s, true); }
    else if (op === 'many') {
      const n = Math.max(1, Math.min(100000, Math.floor(num(a, 100))));
      for (let i = 0; i < n; i++) this.add(`item${++this.counter}`, false);
      this.snap(`加入 ${n} 個新的相異元素 item…`, 2);
    } else if (op === 'dup') {
      const list = [...this.seen].slice(0, 50);
      for (const s of list) this.add(s, false);
      this.snap(`重複加入 ${list.length} 個已出現的元素：暫存器不變，估計值不受影響`, 2);
    } else if (op === 'clear') { this.M.fill(0); this.seen.clear(); this.counter = 0; this.snap('清空'); }
    this.snap(`估計值 E = α·m² / Σ 2^(−M[j])` + (this.estimate() <= 2.5 * this.m && this.M.includes(0) ? '；數量很小且有空暫存器，改用線性計數 m·ln(m/V)' : ''), 4);
  }
}
const hyperloglog: DSDef = {
  id: 'hyperloglog', name: 'HyperLogLog 基數估計', en: 'HyperLogLog', cat: 'ds-prob',
  desc: '只用 m 個小暫存器估計「有幾個相異元素」。每個元素雜湊後，前 p 位決定暫存器，其餘位元的前導零越多代表越罕見；暫存器記錄看過的最大值，再用調和平均估計基數。重複元素不影響結果；數量很小時改用線性計數校正。這裡 m = 16，標準誤差約 26%，m 越大越準。',
  complexity: [['加入', 'O(1)'], ['估計', 'O(m)'], ['空間', 'm 個 5～6 位元暫存器']],
  codes: { add: ['x = hash32(item)', 'j = x 的前 p 位；w = 其餘位元', 'M[j] = max(M[j], 前導零(w) + 1)', 'E = α_m · m² / Σ_j 2^(−M[j])', '若 E ≤ 2.5m 且有 V 個空暫存器：E = m·ln(m / V)'] },
  ops: [
    { key: 'add', label: '加入元素', arg: 'text', argLabel: '字串', rand: word },
    { key: 'many', label: '加入 n 個新元素', arg: 'number', argLabel: 'n', rand: () => rnd.pick([10, 100, 1000, 10000]) },
    { key: 'dup', label: '重複加入舊元素', arg: 'none' },
    { key: 'clear', label: '清空', arg: 'none' },
  ],
  create: () => new HLL(),
  init: [['many', 50]],
};

// ---------------- LRU 快取 ----------------
class LRU extends DSBase<Record<string, Color>> {
  cap = 3;
  order: { k: number; v: number }[] = []; // 由最近使用到最久未用
  panels(h: Record<string, Color> = {}): Panel[] {
    const nodes: GNode[] = [{ id: 'head', x: 0, y: 0, label: 'head', shape: 'rect', w: 46, h: 28, color: 'muted' }];
    const edges: GEdge[] = [];
    this.order.forEach((e, i) => nodes.push({ id: 'k' + e.k, x: (i + 1) * 84, y: 0, label: `${e.k}:${e.v}`, shape: 'rect', w: 56, h: 30, color: h[e.k] }));
    nodes.push({ id: 'tail', x: (this.order.length + 1) * 84, y: 0, label: 'tail', shape: 'rect', w: 46, h: 28, color: 'muted' });
    for (let i = 0; i + 1 < nodes.length; i++) { edges.push({ from: nodes[i].id, to: nodes[i + 1].id, directed: true, curve: 6 }); edges.push({ from: nodes[i + 1].id, to: nodes[i].id, directed: true, curve: 6, dashed: true }); }
    return [{ type: 'graph', nodes, edges, title: '雙向鏈結串列：左邊最近使用，右邊最久未用（下一個被淘汰）', height: 140 }, table(this.order.map((e) => [e.k, `→ 節點 ${e.k}:${e.v}`]), Object.fromEntries(this.order.map((e, i) => [`${i},0`, h[e.k]])), { colHeaders: ['鍵', '雜湊表指向'], title: '雜湊表：O(1) 找到節點', w: 'half' }), vars({ 容量: this.cap, 目前: this.order.length })];
  }
  run(op: string, a?: any, b?: any) {
    if (op === 'cap') { this.cap = Math.max(0, Math.floor(num(a, 3))); while (this.order.length > this.cap) { const e = this.order.pop()!; this.snap(`容量縮小，淘汰最久未用的 ${e.k}`, 5); } this.snap(`容量設為 ${this.cap}` + (this.cap === 0 ? '：任何 put 都不會被保存' : '')); return; }
    const k = Math.floor(num(a));
    const i = this.order.findIndex((e) => e.k === k);
    if (op === 'get') {
      if (i < 0) { this.snap(`get(${k})：雜湊表中沒有，回傳 −1（未命中）`, 1); return; }
      const [e] = this.order.splice(i, 1);
      this.snap(`get(${k})：命中，值 = ${e.v}`, 1, { [k]: 'compare' });
      this.order.unshift(e);
      this.snap(`把節點 ${k} 移到最前面（最近使用）`, 2, { [k]: 'done' });
    } else if (op === 'put') {
      const v = Math.floor(num(b, rnd.int(1, 99)));
      if (this.cap === 0) { this.snap(`容量為 0：put(${k}, ${v}) 不保存任何資料`, 3); return; }
      if (i >= 0) { const [e] = this.order.splice(i, 1); e.v = v; this.order.unshift(e); this.snap(`鍵 ${k} 已存在：更新值為 ${v} 並移到最前面`, 3, { [k]: 'swap' }); return; }
      if (this.order.length >= this.cap) { const old = this.order[this.order.length - 1]; this.snap(`快取已滿，淘汰尾端最久未用的 ${old.k}`, 5, { [old.k]: 'bad' }); this.order.pop(); }
      this.order.unshift({ k, v });
      this.snap(`新增 ${k}:${v} 到最前面，並登錄到雜湊表`, 6, { [k]: 'swap' });
    }
  }
}
const lru: DSDef = {
  id: 'lru-cache', name: '最近最少使用快取', en: 'LRU Cache', cat: 'ds-prob', star: true,
  desc: '容量有限的快取，滿了就淘汰「最久沒被使用」的資料。雜湊表把鍵對應到雙向鏈結串列的節點，串列由最近使用排到最久未用：每次 get／put 都把節點移到頭端，淘汰時刪除尾端，全部 O(1)。容量為 0 時不保存任何資料；put 既有的鍵會更新值並視為使用。',
  complexity: [['get / put', 'O(1)'], ['空間', 'O(容量)']],
  codes: { get: ['get(k): 若 k 不在雜湊表，回傳 −1', '  把節點移到串列頭端，回傳值'], put: ['', '', '', 'put(k, v): 若 k 已存在，更新值並移到頭端', '', '  若已滿：刪除尾端節點（並從雜湊表移除）', '  新節點插到頭端，登錄到雜湊表'], cap: ['', '', '', '', '', '容量縮小時從尾端淘汰'] },
  ops: [
    { key: 'put', label: 'put(k, v)', arg: 'two', argLabel: 'k v', rand: () => [rnd.int(1, 6), rnd.int(10, 99)] },
    { key: 'get', label: 'get(k)', arg: 'number', argLabel: 'k', rand: () => rnd.int(1, 6) },
    { key: 'cap', label: '設定容量', arg: 'number', argLabel: '容量', rand: () => rnd.int(0, 4) },
  ],
  create: () => new LRU(),
  init: [['put', 1, 10], ['put', 2, 20], ['put', 3, 30]],
};

// ---------------- LFU 快取 ----------------
class LFU extends DSBase<Record<string, Color>> {
  cap = 3;
  val = new Map<number, number>();
  freq = new Map<number, number>();
  buckets = new Map<number, number[]>(); // 每個次數一個串列，由最近使用到最久未用
  minFreq = 0;
  panels(h: Record<string, Color> = {}): Panel[] {
    const fs = [...this.buckets.keys()].filter((f) => this.buckets.get(f)!.length).sort((a, b) => a - b);
    const w = Math.max(1, ...fs.map((f) => this.buckets.get(f)!.length));
    const rows = fs.map((f) => Array.from({ length: w }, (_, i) => { const k = this.buckets.get(f)![i]; return k === undefined ? '' : `${k}:${this.val.get(k)}`; }));
    const colors: Record<string, Color> = {};
    fs.forEach((f, r) => this.buckets.get(f)!.forEach((k, c) => { if (h[k]) colors[`${r},${c}`] = h[k]; }));
    return [table(rows.length ? rows : [['（空）']], colors, { rowHeaders: fs.map((f) => `次數 ${f}${f === this.minFreq ? '（最小）' : ''}`), title: '依使用次數分桶；每桶左邊最近使用，右邊最久未用' }), vars({ 容量: this.cap, minFreq: this.minFreq || '—' })];
  }
  touch(k: number) {
    const f = this.freq.get(k)!;
    const b = this.buckets.get(f)!;
    b.splice(b.indexOf(k), 1);
    if (!b.length && this.minFreq === f) this.minFreq = f + 1;
    this.freq.set(k, f + 1);
    if (!this.buckets.has(f + 1)) this.buckets.set(f + 1, []);
    this.buckets.get(f + 1)!.unshift(k);
  }
  run(op: string, a?: any, b?: any) {
    const k = Math.floor(num(a));
    if (op === 'get') {
      if (!this.val.has(k)) { this.snap(`get(${k})：不存在，回傳 −1`, 1); return; }
      this.snap(`get(${k}) = ${this.val.get(k)}，使用次數 ${this.freq.get(k)} → ${this.freq.get(k)! + 1}`, 2, { [k]: 'compare' });
      this.touch(k);
      this.snap(`移到「次數 ${this.freq.get(k)}」桶的最前面`, 2, { [k]: 'done' });
    } else if (op === 'put') {
      const v = Math.floor(num(b, rnd.int(1, 99)));
      if (this.cap <= 0) { this.snap('容量為 0，不保存', 3); return; }
      if (this.val.has(k)) { this.val.set(k, v); this.touch(k); this.snap(`鍵 ${k} 已存在：更新值並增加使用次數`, 3, { [k]: 'swap' }); return; }
      if (this.val.size >= this.cap) {
        const bk = this.buckets.get(this.minFreq)!;
        const old = bk[bk.length - 1];
        this.snap(`已滿：淘汰最小次數 ${this.minFreq} 桶中最久未用的 ${old}（同次數時用 LRU 決勝）`, 5, { [old]: 'bad' });
        bk.pop(); this.val.delete(old); this.freq.delete(old);
      }
      this.val.set(k, v); this.freq.set(k, 1);
      if (!this.buckets.has(1)) this.buckets.set(1, []);
      this.buckets.get(1)!.unshift(k);
      this.minFreq = 1;
      this.snap(`新增 ${k}:${v}，次數 1，minFreq = 1`, 6, { [k]: 'swap' });
    }
  }
}
const lfu: DSDef = {
  id: 'lfu-cache', name: '最不常使用快取', en: 'LFU Cache', cat: 'ds-prob',
  desc: '滿了就淘汰「使用次數最少」的資料；次數相同時淘汰其中最久未用的（LRU 決勝）。用雜湊表記錄每個鍵的值與次數，再依次數分桶，每桶是一條 LRU 串列，並追蹤目前最小次數 minFreq，讓 get／put 都是 O(1)。',
  complexity: [['get / put', 'O(1)'], ['空間', 'O(容量)']],
  codes: { get: ['get(k): 不存在回傳 −1', '  從 freq 桶移到 freq+1 桶的頭端；若舊桶空了且是 minFreq，minFreq += 1'], put: ['', '', '', 'put(k, v): 已存在則更新值並視為使用', '', '  若已滿：刪除 minFreq 桶的尾端（最久未用）', '  新鍵放入次數 1 的桶頭端，minFreq = 1'] },
  ops: [
    { key: 'put', label: 'put(k, v)', arg: 'two', argLabel: 'k v', rand: () => [rnd.int(1, 6), rnd.int(10, 99)] },
    { key: 'get', label: 'get(k)', arg: 'number', argLabel: 'k', rand: () => rnd.int(1, 6) },
  ],
  create: () => new LFU(),
  init: [['put', 1, 10], ['put', 2, 20], ['get', 1], ['put', 3, 30]],
};

export default [bloom, countingBloom, countMin, hyperloglog, lru, lfu] satisfies DSDef[];
