// 影像處理共用工具：固定的測試影像、邊界處理、卷積、Sobel、高斯核
import { inSelect } from './helpers';
import { parkMiller } from './extra';

export type Img = number[][];
export type Border = 'zero' | 'replicate' | 'reflect';

export const blank = (h: number, w: number, v = 0): Img => Array.from({ length: h }, () => new Array(w).fill(v));
export const mapImg = (a: Img, f: (v: number, r: number, c: number) => number): Img => a.map((row, r) => row.map((v, c) => f(v, r, c)));
export const clamp255 = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
export const imgMax = (a: Img) => Math.max(...a.flat());
export const imgMin = (a: Img) => Math.min(...a.flat());

/** 固定的測試影像（16×16，灰階 0–255）；含雜訊的版本使用 Park–Miller 固定種子 */
export const IMG_PRESETS: Record<string, string> = {
  shapes: '幾何圖形',
  checker: '棋盤格',
  step: '階梯邊緣',
  noisy: '圖形＋椒鹽雜訊',
  lowcontrast: '低對比',
  blobs: '相鄰圓斑（二值）',
  lines: '直線（二值）',
  texture: '平滑紋理',
};
export function presetImage(name: string, seed = 7, N = 16): Img {
  const img = blank(N, N);
  const shapes = () => {
    const a = blank(N, N, 30);
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      if (r >= 2 && r <= 6 && c >= 2 && c <= 7) a[r][c] = 200;
      if ((r - 10.5) ** 2 + (c - 10.5) ** 2 <= 3.6 ** 2) a[r][c] = 140;
      if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) a[r][c] = 90;
    }
    return a;
  };
  switch (name) {
    case 'shapes': return shapes();
    case 'checker': return mapImg(img, (_, r, c) => (((r >> 2) + (c >> 2)) % 2 ? 210 : 40));
    case 'step': return mapImg(img, (_, r, c) => (c < 8 ? 60 : 190) + (r >= 11 ? 40 : 0));
    case 'noisy': {
      const a = shapes(), g = parkMiller(seed);
      return mapImg(a, (v) => { const t = g.int(100); return t < 5 ? 0 : t < 10 ? 255 : v; });
    }
    case 'lowcontrast': return mapImg(shapes(), (v, r) => 95 + Math.round(((v - 30) / 170) * 35) + Math.floor(r / 4) * 3);
    case 'blobs': return mapImg(img, (_, r, c) => ((r - 5.5) ** 2 + (c - 5) ** 2 <= 16 || (r - 9) ** 2 + (c - 10.5) ** 2 <= 16 || (r - 13) ** 2 + (c - 2.5) ** 2 <= 3.5 ? 255 : 0));
    case 'lines': {
      const a = blank(N, N);
      for (let c = 1; c <= 14; c++) a[4][c] = 255;
      for (let k = 1; k <= 14; k++) a[15 - k][k] = 255;
      for (let r = 7; r <= 15; r++) a[r][12] = 255;
      return a;
    }
    case 'texture': return mapImg(img, (_, r, c) => textureAt(r, c));
    default: return shapes();
  }
}
/** 平滑紋理：可以在次像素位置取值（光流用） */
export const textureAt = (r: number, c: number) => 128 + 55 * Math.sin(c * 0.7 + 0.3) * Math.cos(r * 0.55) + 35 * Math.sin((r + 0.6 * c) * 0.45);
export const imgSelect = (keys: string[], def = keys[0], label = '測試影像') => inSelect('img', label, keys.map((k) => [k, IMG_PRESETS[k]] as [string, string]), def);
export const borderSelect = (def: Border = 'replicate') => inSelect('border', '邊界處理', [['replicate', '複製最近的邊緣像素'], ['zero', '邊界外補 0'], ['reflect', '鏡射（不重複邊緣）']], def);
export const BORDER_NAME: Record<Border, string> = { replicate: '複製邊緣', zero: '補 0', reflect: '鏡射' };

/** 取像素值，超出範圍時依邊界模式處理 */
export function at(a: Img, r: number, c: number, mode: Border): number {
  const H = a.length, W = a[0].length;
  if (r >= 0 && r < H && c >= 0 && c < W) return a[r][c];
  if (mode === 'zero') return 0;
  if (mode === 'replicate') return a[Math.max(0, Math.min(H - 1, r))][Math.max(0, Math.min(W - 1, c))];
  const ref = (i: number, n: number) => { if (n === 1) return 0; while (i < 0 || i >= n) i = i < 0 ? -i : 2 * (n - 1) - i; return i; };
  return a[ref(r, H)][ref(c, W)];
}
/** 相關運算（與多數影像處理程式相同，不翻轉核心）；結果不裁切 */
export function convolve(a: Img, K: number[][], mode: Border): Img {
  const kh = K.length >> 1, kw = K[0].length >> 1;
  return mapImg(a, (_, r, c) => {
    let s = 0;
    for (let i = -kh; i <= kh; i++) for (let j = -kw; j <= kw; j++) s += K[i + kh][j + kw] * at(a, r + i, c + j, mode);
    return s;
  });
}
export const SOBEL_X = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
export const SOBEL_Y = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
export const sobel = (a: Img, mode: Border = 'replicate') => ({ gx: convolve(a, SOBEL_X, mode), gy: convolve(a, SOBEL_Y, mode) });

/** 一維高斯核：半徑 ⌈3σ⌉（最多 3），正規化使總和為 1 */
export function gaussKernel1D(sigma: number): number[] {
  const rad = Math.min(3, Math.ceil(3 * sigma));
  const k = Array.from({ length: 2 * rad + 1 }, (_, i) => Math.exp(-((i - rad) ** 2) / (2 * sigma * sigma)));
  const s = k.reduce((x, y) => x + y, 0);
  return k.map((v) => v / s);
}
/** 可分離的高斯模糊：先水平再垂直 */
export function gaussBlur(a: Img, sigma: number, mode: Border = 'replicate'): Img {
  const k = gaussKernel1D(sigma);
  const h = convolve(a, [k], mode);
  return convolve(h, k.map((v) => [v]), mode);
}
export function histogram(a: Img, bins = 256): number[] {
  const h = new Array(bins).fill(0);
  for (const v of a.flat()) h[Math.min(bins - 1, Math.floor((v * bins) / 256))]++;
  return h;
}
export const toBinary = (a: Img, t = 128) => mapImg(a, (v) => (v >= t ? 1 : 0));
export const N4: [number, number][] = [[-1, 0], [0, -1], [0, 1], [1, 0]];
export const N8: [number, number][] = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
export const roundImg = (a: Img, d = 1) => mapImg(a, (v) => +v.toFixed(d));
