// 擴充主題共用的小工具：矩陣解析、環狀排列、BigInt 模運算、字母處理、固定種子亂數
import type { Color, GNode, GraphPanel } from './types';

/** 解析 "1 2; 3 4" 或多行文字為矩陣；檢查每列長度一致 */
export function parseMatrix(src: string, name = '矩陣'): number[][] {
  const rows = String(src)
    .split(/[;\n]+/)
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => r.split(/[\s,，]+/).filter(Boolean).map(Number));
  if (!rows.length) throw new Error(`${name}不可為空`);
  if (rows.some((r) => r.some((x) => Number.isNaN(x)))) throw new Error(`${name}含有非數字`);
  if (rows.some((r) => r.length !== rows[0].length)) throw new Error(`${name}每列長度必須相同`);
  return rows;
}

export const matText = (m: number[][]) => m.map((r) => r.join(' ')).join('; ');

/** 解析以逗號或空白分隔的整數列表 */
export function parseInts(src: string, name = '數列'): number[] {
  const a = String(src).split(/[\s,，;]+/).filter(Boolean).map(Number);
  if (a.some((x) => !Number.isInteger(x))) throw new Error(`${name}只能包含整數`);
  return a;
}

/** 數學上的模：結果一定落在 [0, m) */
export const mod = (a: number, m: number) => ((a % m) + m) % m;

export function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

/** 模反元素；不存在時回傳 null */
export function invMod(a: number, m: number): number | null {
  let [r0, r1, s0, s1] = [mod(a, m), m, 1, 0];
  while (r1) {
    const q = Math.floor(r0 / r1);
    [r0, r1] = [r1, r0 - q * r1];
    [s0, s1] = [s1, s0 - q * s1];
  }
  return r0 === 1 ? mod(s0, m) : null;
}

export function powModBig(b: bigint, e: bigint, m: bigint): bigint {
  let r = 1n;
  b %= m;
  if (b < 0n) b += m;
  while (e > 0n) {
    if (e & 1n) r = (r * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return r;
}

/** 安全整數範圍內的模冪（中間乘積改用 BigInt） */
export const powMod = (b: number, e: number, m: number) => Number(powModBig(BigInt(b), BigInt(e), BigInt(m)));
export const mulMod = (a: number, b: number, m: number) => Number((BigInt(a) * BigInt(b)) % BigInt(m));

export function isPrime(n: number): boolean {
  if (n < 2 || !Number.isInteger(n)) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

/** 把 n 個節點排成圓環（第 0 個在正上方，順時針） */
export function ringNodes(labels: string[], radius: number, o: { prefix?: string; colors?: Record<number, Color | undefined>; subs?: (string | undefined)[]; r?: number } = {}): GNode[] {
  const n = labels.length;
  return labels.map((label, i) => {
    const t = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { id: (o.prefix ?? 'n') + i, x: Math.cos(t) * radius, y: Math.sin(t) * radius, label, color: o.colors?.[i], sub: o.subs?.[i], r: o.r ?? 15 };
  });
}

export function ringPanel(labels: string[], colors: Record<number, Color | undefined> = {}, o: { title?: string; w?: 'full' | 'half'; subs?: (string | undefined)[] } = {}): GraphPanel {
  const radius = Math.max(70, labels.length * 7.2);
  return { type: 'graph', title: o.title, w: o.w, nodes: ringNodes(labels, radius, { colors, subs: o.subs }), edges: [], height: 360 };
}

export const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const isLetter = (c: string) => /^[A-Za-z]$/.test(c);
/** 只保留英文字母並轉大寫 */
export const lettersOnly = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, '');

/** 與各語言實作一致的 Park–Miller 亂數：s = s·48271 mod (2^31 − 1) */
export function parkMiller(seed: number) {
  let s = Math.max(1, Math.floor(seed) % 2147483647);
  return {
    next() {
      s = (s * 48271) % 2147483647;
      return s;
    },
    /** [0, n) 的整數 */
    int(n: number) {
      return this.next() % n;
    },
    /** [0, 1) 的實數 */
    real() {
      return this.next() / 2147483647;
    },
  };
}

export const hex2 = (b: number) => b.toString(16).padStart(2, '0');
export const toHex = (bytes: ArrayLike<number>) => Array.from(bytes, hex2).join('');
export function fromHex(s: string, name = '十六進位字串'): number[] {
  const t = String(s).replace(/\s+/g, '').toLowerCase();
  if (!/^([0-9a-f]{2})*$/.test(t)) throw new Error(`${name}格式錯誤（需偶數個 0-9、a-f）`);
  return Array.from({ length: t.length / 2 }, (_, i) => parseInt(t.slice(2 * i, 2 * i + 2), 16));
}
export const utf8 = (s: string) => Array.from(new TextEncoder().encode(s));

/** 以分數表示機率，自動約分 */
export function frac(n: number, d: number): string {
  if (d === 0) return '—';
  const g = gcd(n, d) || 1;
  return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`;
}
