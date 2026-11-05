import type { BarsPanel, CMap, Color, Frame, ImagePanel, Panel, Pointer, TablePanel, TextPanel, VarsPanel, InputSpec } from './types';

/** 畫格記錄器：snap 時深拷貝 panel，避免之後的修改影響已記錄的畫格 */
export class Rec {
  frames: Frame[] = [];
  snap(msg: string, panels: Panel[], line?: number) {
    this.frames.push({ msg, line, panels: structuredClone(panels) });
  }
  get done() {
    return this.frames;
  }
}

export const fmt = (v: unknown): string => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') {
    if (v === Infinity) return '∞';
    if (v === -Infinity) return '-∞';
    if (Number.isNaN(v)) return 'NaN';
    return Number.isInteger(v) ? String(v) : String(+v.toFixed(3));
  }
  if (typeof v === 'boolean') return v ? 'T' : 'F';
  if (Array.isArray(v)) return '[' + v.map(fmt).join(', ') + ']';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

export function bars(values: number[], colors: CMap = {}, o: Partial<BarsPanel> = {}): BarsPanel {
  return { type: 'bars', values, colors, ...o };
}

/** 一維格子陣列（含索引表頭、指標列） */
export function cells(
  values: unknown[],
  colors: CMap = {},
  o: { title?: string; pointers?: Pointer[]; headers?: false | (string | number)[]; w?: 'full' | 'half' | 'auto' } = {},
): TablePanel {
  const c: Record<string, Color | undefined> = {};
  for (const k in colors) c[`0,${k}`] = colors[k];
  return {
    type: 'table',
    title: o.title,
    w: o.w,
    rows: [values.map(fmt)],
    colors: c,
    colHeaders: o.headers === false ? undefined : o.headers ?? values.map((_, i) => i),
    pointers: o.pointers?.map((p) => ({ c: p.index, label: p.label, color: p.color })),
  };
}

/** 二維表格；colors 的 key 為 "r,c" */
export function table(
  rows: unknown[][],
  colors: Record<string, Color | undefined> = {},
  o: Partial<Omit<TablePanel, 'type' | 'rows' | 'colors'>> = {},
): TablePanel {
  return { type: 'table', rows: rows.map((r) => r.map(fmt)), colors, ...o };
}

export function vars(obj: Record<string, unknown>, title?: string, colors: Record<string, Color> = {}): VarsPanel {
  return {
    type: 'vars',
    title,
    w: 'auto',
    items: Object.entries(obj).map(([k, v]) => ({ k, v: fmt(v), color: colors[k] })),
  };
}

export function text(lines: string[], title?: string, w?: 'full' | 'half' | 'auto'): TextPanel {
  return { type: 'text', title, lines, w };
}

/** 影像面板；o.colors 的 key 為 "r,c" */
export function img(px: number[][], o: Partial<Omit<ImagePanel, 'type' | 'px'>> = {}): ImagePanel {
  return { type: 'image', px, ...o };
}

export function range(lo: number, hi: number, color: Color, base: CMap = {}): CMap {
  const m: CMap = { ...base };
  for (let i = lo; i <= hi; i++) m[i] = color;
  return m;
}

export function setColors(idx: Iterable<number | string>, color: Color, base: CMap = {}): CMap {
  const m: CMap = { ...base };
  for (const i of idx) m[i] = color;
  return m;
}

// ---------- 隨機 ----------
export const rnd = {
  int: (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1)),
  arr: (n: number, lo = 1, hi = 99) => Array.from({ length: n }, () => rnd.int(lo, hi)),
  sorted: (n: number, lo = 1, hi = 99) => rnd.arr(n, lo, hi).sort((a, b) => a - b),
  distinct: (n: number, lo = 1, hi = 99) => {
    const s = new Set<number>();
    while (s.size < n && s.size < hi - lo + 1) s.add(rnd.int(lo, hi));
    return [...s];
  },
  pick: <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)],
  shuffle: <T,>(a: T[]) => {
    const b = [...a];
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  },
};

/** 帶種子的亂數，讓「隨機」演算法每次重播結果一致 */
export function seeded(seed: number) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- 常用輸入 ----------
export const inArr = (def: number[], label = '陣列', n = def.length, lo = 1, hi = 99): InputSpec => ({
  key: 'arr',
  label,
  type: 'array',
  default: def,
  random: () => rnd.arr(n, lo, hi),
});
export const inSorted = (def: number[], label = '已排序陣列', n = def.length): InputSpec => ({
  key: 'arr',
  label,
  type: 'array',
  default: def,
  random: () => rnd.sorted(n, 1, 99),
});
export const inNum = (key: string, label: string, def: number, min?: number, max?: number, random?: (cur: Record<string, any>) => number): InputSpec => ({
  key,
  label,
  type: 'number',
  default: def,
  min,
  max,
  random,
});
export const inText = (key: string, label: string, def: string, random?: (cur: Record<string, any>) => string, multiline = false): InputSpec => ({
  key,
  label,
  type: 'text',
  default: def,
  random,
  multiline,
});
export const inSelect = (key: string, label: string, options: [string, string][], def = options[0][0]): InputSpec => ({
  key,
  label,
  type: 'select',
  default: def,
  options: options.map(([value, label]) => ({ value, label })),
});
export const inSeed = (): InputSpec => inNum('seed', '亂數種子', 42, 1, 1e9, () => rnd.int(1, 99999));

export const sleepless = () => undefined;
