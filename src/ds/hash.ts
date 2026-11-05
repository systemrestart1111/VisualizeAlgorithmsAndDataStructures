import type { Color, DSDef, Panel } from '../core/types';
import { table, vars, rnd } from '../core/helpers';
import { DSBase, num } from './base';

const cat = 'ds-hash';
const rk = () => rnd.int(1, 99);

class Chaining extends DSBase<Record<string, Color>> {
  m = 7;
  b: number[][] = Array.from({ length: 7 }, () => []);
  n = 0;
  h = (k: number) => ((k % this.m) + this.m) % this.m;
  panels(c: Record<string, Color> = {}): Panel[] {
    const w = Math.max(1, ...this.b.map((x) => x.length));
    const rows = this.b.map((x) => Array.from({ length: w }, (_, i) => (x[i] !== undefined ? x[i] : '')));
    const col: Record<string, Color> = {};
    this.b.forEach((x, i) => { for (let j = x.length; j < w; j++) col[`${i},${j}`] = 'muted'; });
    return [table(rows, { ...col, ...c }, { rowHeaders: this.b.map((_, i) => `[${i}] →`), title: `雜湊表（鏈結法），h(k) = k mod ${this.m}` }), vars({ 元素數: this.n, 桶數: this.m, '負載因子 α': +(this.n / this.m).toFixed(2) })];
  }
  run(op: string, a?: any) {
    const k = num(a, rk());
    if (op === 'fill') { for (const x of rnd.distinct(8)) this.run('insert', x); this.r.frames = []; this.snap('隨機插入 8 個鍵'); return; }
    const i = this.h(k);
    this.snap(`h(${k}) = ${k} mod ${this.m} = ${i}`, 1, Object.fromEntries(this.b[i].map((_, j) => [`${i},${j}`, 'frontier' as Color])));
    if (op === 'insert') {
      for (let j = 0; j < this.b[i].length; j++) {
        this.snap(`比較鏈上的 ${this.b[i][j]}`, 2, { [`${i},${j}`]: 'compare' });
        if (this.b[i][j] === k) { this.snap(`${k} 已存在`, 2, { [`${i},${j}`]: 'done' }); return; }
      }
      this.b[i].push(k); this.n++;
      this.snap(`把 ${k} 接到桶 ${i} 的鏈尾`, 3, { [`${i},${this.b[i].length - 1}`]: 'swap' });
      if (this.n / this.m > 1) {
        const old = this.b.flat();
        this.m = this.m * 2 + 1;
        this.b = Array.from({ length: this.m }, () => []);
        for (const x of old) this.b[this.h(x)].push(x);
        this.snap(`負載因子 > 1，擴充為 ${this.m} 個桶並重新雜湊（rehash）所有鍵`, 4);
      }
    } else if (op === 'search' || op === 'delete') {
      for (let j = 0; j < this.b[i].length; j++) {
        this.snap(`比較鏈上的 ${this.b[i][j]}`, 2, { [`${i},${j}`]: 'compare' });
        if (this.b[i][j] === k) {
          if (op === 'search') { this.snap(`找到 ${k}`, 2, { [`${i},${j}`]: 'done' }); return; }
          this.snap(`找到 ${k}，從鏈中移除`, 5, { [`${i},${j}`]: 'bad' });
          this.b[i].splice(j, 1); this.n--;
          this.snap('刪除完成', 5);
          return;
        }
      }
      this.snap(`桶 ${i} 中沒有 ${k}`, 2);
    }
  }
}

const chaining: DSDef = {
  id: 'ds-hash-chaining', name: '雜湊表：鏈結法', en: 'Hash Table — Separate Chaining', cat, star: true,
  desc: '用雜湊函數把鍵映射到桶（bucket），發生碰撞的鍵串在同一個桶的鏈結串列上。平均每條鏈長度為負載因子 α = n/m；α 過大時擴充桶數並重新雜湊，維持平均 O(1)。',
  complexity: [['插入／搜尋／刪除（平均）', 'O(1 + α)'], ['最差（全部碰撞）', 'O(n)'], ['空間', 'O(n + m)']],
  codes: { insert: ['i = h(k)', '走訪 bucket[i]，若已存在則結束', 'bucket[i].append(k)', '若 n/m > 1：擴充並 rehash'], search: ['i = h(k)', '走訪 bucket[i] 比較每個鍵'], delete: ['i = h(k)', '走訪 bucket[i] 比較每個鍵', '', '', '找到後從鏈中移除'] },
  ops: [
    { key: 'insert', label: '插入', arg: 'number', rand: rk },
    { key: 'search', label: '搜尋', arg: 'number', rand: rk },
    { key: 'delete', label: '刪除', arg: 'number', rand: rk },
  ],
  create: () => new Chaining(),
  init: [['fill']],
};

const DEL = -1;

class OpenAddr extends DSBase<Record<number, Color>> {
  m = 11;
  t: (number | null)[] = new Array(11).fill(null);
  n = 0;
  mode: 'linear' | 'quadratic' | 'double' = 'linear';
  h1 = (k: number) => k % this.m;
  h2 = (k: number) => 7 - (k % 7);
  probe(k: number, i: number) {
    if (this.mode === 'linear') return (this.h1(k) + i) % this.m;
    if (this.mode === 'quadratic') return (this.h1(k) + i * i) % this.m;
    return (this.h1(k) + i * this.h2(k)) % this.m;
  }
  formula() {
    return this.mode === 'linear' ? '(h(k) + i) mod m' : this.mode === 'quadratic' ? '(h(k) + i²) mod m' : '(h(k) + i·h₂(k)) mod m，h₂(k) = 7 − k mod 7';
  }
  panels(c: Record<number, Color> = {}): Panel[] {
    const col: Record<string, Color> = {};
    this.t.forEach((v, i) => { if (v === null) col[`0,${i}`] = 'muted'; if (v === DEL) col[`0,${i}`] = 'visited'; if (c[i]) col[`0,${i}`] = c[i]; });
    return [table([this.t.map((v) => (v === null ? '' : v === DEL ? '⌫' : v))], col, { colHeaders: this.t.map((_, i) => i), title: `開放定址（${{ linear: '線性探測', quadratic: '二次探測', double: '雙重雜湊' }[this.mode]}）：probe(k, i) = ${this.formula()}　⌫ = 刪除標記` }), vars({ 元素數: this.n, 大小: this.m, '負載因子 α': +(this.n / this.m).toFixed(2), 探測方式: this.mode })];
  }
  run(op: string, a?: any) {
    if (op === 'mode') {
      const m = String(a ?? '').trim();
      const next = (['linear', 'quadratic', 'double'] as const).find((x) => x.startsWith(m)) ?? (this.mode === 'linear' ? 'quadratic' : this.mode === 'quadratic' ? 'double' : 'linear');
      const keys = this.t.filter((v): v is number => v !== null && v !== DEL);
      this.mode = next;
      this.t = new Array(this.m).fill(null); this.n = 0;
      for (const k of keys) this.run('insert', k);
      this.r.frames = [];
      this.snap(`改用 ${next}，重新插入所有鍵`);
      return;
    }
    if (op === 'fill') { for (const x of rnd.distinct(6)) this.run('insert', x); this.r.frames = []; this.snap('隨機插入 6 個鍵'); return; }
    const k = num(a, rk());
    const trail: Record<number, Color> = {};
    if (op === 'insert') {
      if (this.n >= this.m * 0.75) {
        const keys = this.t.filter((v): v is number => v !== null && v !== DEL);
        this.m = this.m * 2 + 1;
        this.t = new Array(this.m).fill(null); this.n = 0;
        for (const x of keys) this.run('insert', x);
        this.r.frames = this.r.frames.slice(0, 0);
        this.snap(`負載因子 ≥ 0.75，擴充為 ${this.m} 並重新插入`, 5);
      }
      let firstDel = -1;
      for (let i = 0; i < this.m; i++) {
        const p = this.probe(k, i);
        const v = this.t[p];
        if (v === k) { this.snap(`${k} 已存在於 ${p}`, 2, { ...trail, [p]: 'done' }); return; }
        if (v === DEL) {
          trail[p] = 'compare';
          if (firstDel < 0) firstDel = p;
          this.snap(`i = ${i}：位置 ${p} 是刪除標記，記下可用位置，繼續確認 ${k} 不存在`, 2, { ...trail });
          continue;
        }
        if (v === null) {
          const pos = firstDel >= 0 ? firstDel : p;
          this.t[pos] = k; this.n++;
          this.snap(`i = ${i}：${firstDel >= 0 ? `遇到空位，確認 ${k} 不存在，放入先前記下的刪除標記位置 ${pos}` : `把 ${k} 放入位置 ${pos}`}`, 3, { ...trail, [pos]: 'swap' });
          return;
        }
        trail[p] = 'bad';
        this.snap(`i = ${i}：probe = ${p} 已被 ${v} 佔用（碰撞），繼續探測`, 2, { ...trail });
      }
      if (firstDel >= 0) { this.t[firstDel] = k; this.n++; this.snap(`放入刪除標記位置 ${firstDel}`, 3, { [firstDel]: 'swap' }); return; }
      // 探測序列沒有涵蓋到任何空位（例如二次探測），擴充後重試
      const keys = this.t.filter((v): v is number => v !== null && v !== DEL);
      this.m = this.m * 2 + 1;
      this.t = new Array(this.m).fill(null); this.n = 0;
      const saved = this.r.frames;
      for (const x of keys) this.run('insert', x);
      this.r.frames = saved;
      this.snap(`探測序列找不到空位，擴充為 ${this.m} 並重新插入，再插入 ${k}`, 5);
      this.run('insert', k);
      return;
    }
    for (let i = 0; i < this.m; i++) {
      const p = this.probe(k, i);
      const v = this.t[p];
      if (v === null) { this.snap(`i = ${i}：位置 ${p} 為空 → ${k} 不存在`, 4, { ...trail, [p]: 'compare' }); return; }
      if (v === k) {
        if (op === 'search') { this.snap(`i = ${i}：在位置 ${p} 找到 ${k}`, 4, { ...trail, [p]: 'done' }); return; }
        this.t[p] = DEL; this.n--;
        this.snap(`在位置 ${p} 找到 ${k}，放上刪除標記（不能直接清空，否則會截斷其他鍵的探測序列）`, 6, { ...trail, [p]: 'bad' });
        return;
      }
      trail[p] = 'compare';
      this.snap(`i = ${i}：位置 ${p} 是 ${v === DEL ? '刪除標記' : v}，繼續`, 4, { ...trail });
    }
    this.snap(`${k} 不存在`, 4);
  }
}

const openAddr: DSDef = {
  id: 'ds-hash-open', name: '雜湊表：開放定址', en: 'Hash Table — Open Addressing', cat, star: true,
  desc: '所有鍵都存在陣列本身。碰撞時依「探測序列」尋找下一個空位：線性探測容易形成群聚（primary clustering）；二次探測減輕群聚；雙重雜湊用第二個雜湊函數決定步長，分布最均勻。刪除時需放「墓碑」標記。',
  complexity: [['插入／搜尋（平均）', 'O(1 / (1 − α))'], ['最差', 'O(n)'], ['空間', 'O(m)']],
  codes: { insert: ['for i = 0, 1, 2, ...:', '  p = probe(k, i)；若 t[p] == k 已存在', '  若 t[p] 為空或刪除標記：放入', '', '若 α ≥ 0.75：擴充並重新插入'], search: ['', '', '', 'for i: p = probe(k, i)；空位則不存在；相等則找到'], delete: ['', '', '', 'for i: p = probe(k, i)', '', '找到後設為刪除標記（墓碑）'] },
  ops: [
    { key: 'insert', label: '插入', arg: 'number', rand: rk },
    { key: 'search', label: '搜尋', arg: 'number', rand: rk },
    { key: 'delete', label: '刪除', arg: 'number', rand: rk },
    { key: 'mode', label: '切換探測方式', arg: 'text', argLabel: 'linear/quadratic/double', rand: () => rnd.pick(['linear', 'quadratic', 'double']) },
  ],
  create: () => new OpenAddr(),
  init: [['insert', 22], ['insert', 33], ['insert', 44], ['insert', 5], ['insert', 16], ['insert', 27]],
};

export default [chaining, openAddr];
