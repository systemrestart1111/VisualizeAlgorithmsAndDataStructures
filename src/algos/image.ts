// 影像處理（一）：濾波、梯度、角點、邊緣、二值化與直方圖
import type { AlgoDef, Color, Panel } from '../core/types';
import { Rec, bars, img, inNum, inSelect, inText, rnd, table, text, vars } from '../core/helpers';
import { parseMatrix } from '../core/extra';
import { BORDER_NAME, type Border, type Img, N8, at, blank, borderSelect, clamp255, convolve, gaussBlur, gaussKernel1D, histogram, imgMax, imgMin, imgSelect, mapImg, presetImage, sobel } from '../core/imagelib';

const cat = 'image';
type CM = Record<string, Color | undefined>;
const half = 'half' as const;
const gray = (a: Img, title: string, o: Partial<Parameters<typeof img>[1]> = {}) => img(a, { title, w: half, ...o });
const auto = (a: Img, title: string, o: Partial<Parameters<typeof img>[1]> = {}) => {
  const lo = imgMin(a), hi = imgMax(a);
  return lo < 0 ? img(a, { title, w: half, palette: 'signed', range: [lo, hi], ...o }) : img(a, { title, w: half, range: [Math.min(0, lo), hi || 1], ...o });
};
const win = (r: number, c: number, rad: number, color: Color = 'swap'): CM => { const o: CM = {}; for (let i = -rad; i <= rad; i++) for (let j = -rad; j <= rad; j++) o[`${r + i},${c + j}`] = color; return o; };
const f2 = (v: number) => { const x = +v.toFixed(2); return Math.abs(x) < 1e-9 ? 0 : x; };
const flatImg = () => blank(16, 16, 120);

// ---------------- 影像卷積 ----------------
const KERNELS: Record<string, { k: number[][]; name: string }> = {
  box: { k: [[1, 1, 1], [1, 1, 1], [1, 1, 1]].map((r) => r.map((v) => v / 9)), name: '平均（模糊）' },
  sharpen: { k: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], name: '銳化' },
  laplace: { k: [[0, 1, 0], [1, -4, 1], [0, 1, 0]], name: '拉普拉斯（邊緣）' },
  emboss: { k: [[-2, -1, 0], [-1, 1, 1], [0, 1, 2]], name: '浮雕' },
  custom: { k: [], name: '自訂（下方輸入）' },
};
const convolution: AlgoDef = {
  id: 'image-convolution', name: '影像卷積', en: 'Image Convolution (Correlation)', cat,
  desc: '把一個小矩陣（核心）放在每個像素上，對應位置相乘後加總，就得到輸出像素。不同核心產生模糊、銳化、邊緣等效果。視窗超出影像時需要「邊界處理」：補 0、複製邊緣或鏡射，結果在邊框附近會不同。這裡和多數影像庫一樣不翻轉核心（嚴格來說是相關運算；對稱核心兩者相同）。先逐格手算幾個像素，再完成整張圖。',
  time: 'O(HW·k²)', space: 'O(HW)',
  code: ['for 每個像素 (r, c):', '  s = 0', '  for 核心每個位置 (i, j)（以中心為原點）:', '    v = 影像在 (r+i, c+j) 的值（超出範圍依邊界模式取值）', '    s += K[i][j] · v', '  out[r][c] = s', '顯示時把結果裁切到 0–255（負值以藍色表示）'],
  inputs: [imgSelect(['shapes', 'step', 'checker', 'noisy']), inSelect('kernel', '核心', Object.entries(KERNELS).map(([k, v]) => [k, v.name])), inText('custom', '自訂 3×3 核心（kernel 選「自訂」時使用）', '1 2 1; 2 4 2; 1 2 1', () => Array.from({ length: 3 }, () => rnd.arr(3, -2, 3).join(' ')).join('; ')), borderSelect()],
  run({ img: name, kernel, custom, border }) {
    const r = new Rec();
    const A = presetImage(name);
    let K = KERNELS[kernel].k;
    if (kernel === 'custom') { K = parseMatrix(custom, '自訂核心'); if (K.length !== 3 || K[0].length !== 3) throw new Error('自訂核心必須是 3×3'); }
    const mode = border as Border;
    const kt = table(K.map((row) => row.map(f2)), {}, { title: '核心 K', w: half, rowHeaders: ['−1', '0', '+1'], colHeaders: ['−1', '0', '+1'] });
    r.snap(`核心：${KERNELS[kernel].name}，邊界：${BORDER_NAME[mode]}`, [gray(A, '輸入影像'), kt], 1);
    const out: Img = blank(16, 16, NaN);
    const show = [[0, 0], [0, 8], [5, 4], [10, 10]];
    for (const [pr, pc] of show) {
      const vals = [-1, 0, 1].map((i) => [-1, 0, 1].map((j) => at(A, pr + i, pc + j, mode)));
      let s = 0;
      const prod = vals.map((row, i) => row.map((v, j) => { s += K[i][j] * v; return `${f2(K[i][j])}×${v}`; }));
      const outside = vals.some((row, i) => row.some((_, j) => pr + i - 1 < 0 || pc + j - 1 < 0 || pr + i - 1 > 15 || pc + j - 1 > 15));
      r.snap(`像素 (${pr}, ${pc})：${outside ? `視窗超出影像，邊界外的值依「${BORDER_NAME[mode]}」取得；` : ''}九個乘積加總 = ${f2(s)}`, [gray(A, '輸入影像', { colors: win(pr, pc, 1) }), table(prod, {}, { title: 'K[i][j] × 像素值', w: half }), table(vals, outside ? Object.fromEntries(vals.flatMap((row, i) => row.map((_, j) => [`${i},${j}`, (pr + i - 1 < 0 || pc + j - 1 < 0 || pr + i - 1 > 15 || pc + j - 1 > 15 ? 'special' : undefined) as Color | undefined]))) : {}, { title: '視窗內的值（紫：邊界外取得）', w: half })], 5);
    }
    const full = convolve(A, K, mode);
    for (let rr = 0; rr < 16; rr += 4) {
      for (let k = rr; k < rr + 4; k++) out[k] = full[k];
      r.snap(`完成第 ${rr}–${rr + 3} 列`, [gray(A, '輸入影像'), auto(out.map((row) => row.map((v) => (Number.isNaN(v) ? 0 : v))), '輸出（未裁切）')], 6);
    }
    const neg = full.flat().filter((v) => v < 0).length, over = full.flat().filter((v) => v > 255).length;
    r.snap(`卷積完成：${neg} 個像素為負值、${over} 個超過 255；顯示用的影像會裁切到 0–255`, [gray(A, '輸入影像'), auto(full, '原始輸出（藍：負值）'), gray(mapImg(full, clamp255), '裁切到 0–255'), kt], 7);
    return r.frames;
  },
};

// ---------------- 高斯模糊 ----------------
const gaussian: AlgoDef = {
  id: 'gaussian-blur', name: '高斯模糊', en: 'Gaussian Blur (Separable)', cat,
  desc: '用二維高斯函數 G(x, y) ∝ exp(−(x² + y²)/(2σ²)) 當卷積核心：越靠近中心權重越大，σ 越大越模糊。核心必須正規化（總和為 1），平坦區域的亮度才不會改變。二維高斯可以拆成水平與垂直兩次一維卷積，計算量從 O(k²) 降為 O(2k)。最後用一張全部是 120 的常數影像檢查：除了「補 0」的邊界外，結果應該完全不變。',
  time: 'O(HW·k)（可分離）', space: 'O(HW)',
  code: ['半徑 = ⌈3σ⌉（本頁最多 3），g[i] = exp(−i²/(2σ²))', 'g ← g / Σg            (正規化)', '水平：H[r][c] = Σ g[j]·img[r][c+j]', '垂直：out[r][c] = Σ g[i]·H[r+i][c]', '等同於用 g·gᵀ 做二維卷積', '常數影像經過正規化核心仍為常數'],
  inputs: [imgSelect(['noisy', 'shapes', 'checker']), inSelect('sigma', 'σ', [['0.6', '0.6'], ['1', '1.0'], ['1.5', '1.5'], ['2', '2.0']], '1'), borderSelect()],
  run({ img: name, sigma, border }) {
    const r = new Rec();
    const A = presetImage(name);
    const s = Number(sigma), mode = border as Border;
    const g = gaussKernel1D(s);
    const raw = g.map((_, i) => Math.exp(-((i - (g.length >> 1)) ** 2) / (2 * s * s)));
    r.snap(`σ = ${s}：一維權重 exp(−i²/2σ²) = ${raw.map((v) => v.toFixed(3)).join(' ')}，總和 ${raw.reduce((a, b) => a + b, 0).toFixed(3)}`, [gray(A, '輸入影像'), bars(raw.map((v) => +v.toFixed(3)), {}, { labels: raw.map((_, i) => String(i - (g.length >> 1))), title: '未正規化', w: half })], 1);
    r.snap(`除以總和後 g = ${g.map((v) => v.toFixed(3)).join(' ')}（總和 1）；二維核心 = g·gᵀ`, [table(g.map((a) => g.map((b) => +(a * b).toFixed(3))), {}, { title: '二維核心 g·gᵀ', w: half }), bars(g.map((v) => +v.toFixed(3)), {}, { labels: g.map((_, i) => String(i - (g.length >> 1))), title: '正規化後', w: half })], 2);
    const H = convolve(A, [g], mode);
    r.snap('第一次：每一列做水平一維卷積', [gray(A, '輸入影像'), gray(H, '水平模糊後', { range: [0, 255] })], 3);
    const out = convolve(H, g.map((v) => [v]), mode);
    r.snap('第二次：每一行做垂直一維卷積，得到二維高斯模糊', [gray(H, '水平模糊後', { range: [0, 255] }), gray(out, '高斯模糊結果', { range: [0, 255] })], 4);
    const direct = convolve(A, g.map((a) => g.map((b) => a * b)), mode);
    const diff = Math.max(...out.flat().map((v, i) => Math.abs(v - direct.flat()[i])));
    const C = gaussBlur(flatImg(), s, mode);
    const dev = Math.max(...C.flat().map((v) => Math.abs(v - 120)));
    r.snap(`可分離版本與直接二維卷積最大差 ${diff.toExponential(1)}；常數影像（全為 120）模糊後最大偏差 ${f2(dev)}${dev < 1e-9 ? '，保持常數' : mode === 'zero' ? '：邊框附近變暗，因為「補 0」把邊界外當成黑色' : ''}`, [gray(A, '輸入影像'), gray(out, '高斯模糊結果', { range: [0, 255] }), gray(C, '常數影像的結果', { range: [0, 255] })], 6);
    return r.frames;
  },
};

// ---------------- 中值濾波 ----------------
const median: AlgoDef = {
  id: 'median-filter', name: '中值濾波', en: 'Median Filter', cat,
  desc: '把每個像素換成視窗內所有值的中位數。它是非線性的：一個極端的雜訊點（椒鹽雜訊的 0 或 255）只會排在最兩端，不會影響中位數，因此能幾乎完全去除；平均濾波則會把雜訊抹開成一團灰點，也會讓邊緣變模糊。中位數可以用快速選擇在 O(k²) 期望時間求得。邊界一律用同樣的規則補值。',
  time: 'O(HW·k²)（快速選擇）', space: 'O(k²)',
  code: ['for 每個像素 (r, c):', '  w = 視窗內 k×k 個值（超出範圍依邊界模式）', '  out[r][c] = w 的中位數（快速選擇第 ⌊k²/2⌋ 小）', '對照：平均濾波 out = Σw / k²', '極端值只會在排序後的兩端 → 中位數不受影響'],
  inputs: [imgSelect(['noisy', 'shapes']), inSelect('k', '視窗', [['3', '3×3'], ['5', '5×5']]), borderSelect()],
  run({ img: name, k, border }) {
    const r = new Rec();
    const A = presetImage(name);
    const rad = Number(k) >> 1, mode = border as Border;
    const winVals = (a: Img, pr: number, pc: number) => { const w: number[] = []; for (let i = -rad; i <= rad; i++) for (let j = -rad; j <= rad; j++) w.push(at(a, pr + i, pc + j, mode)); return w; };
    const isNoise = (v: number) => v === 0 || v === 255;
    const noiseCount = (a: Img) => a.flat().filter(isNoise).length;
    r.snap(`輸入影像有 ${noiseCount(A)} 個值為 0 或 255 的雜訊點`, [gray(A, '輸入影像')], 1);
    const picks: [number, number][] = [];
    for (let pr = 0; pr < 16 && picks.length < 2; pr++) for (let pc = 0; pc < 16 && picks.length < 2; pc++) if (isNoise(A[pr][pc]) && pr > 0 && pc > 0) picks.push([pr, pc]);
    picks.push([4, 7]);
    for (const [pr, pc] of picks) {
      const w = winVals(A, pr, pc), sorted = [...w].sort((a, b) => a - b), m = sorted[sorted.length >> 1], mean = w.reduce((a, b) => a + b, 0) / w.length;
      r.snap(`像素 (${pr}, ${pc}) = ${A[pr][pc]}：視窗排序後中位數 ${m}（平均值則是 ${f2(mean)}）`, [gray(A, '輸入影像', { colors: { ...win(pr, pc, rad), [`${pr},${pc}`]: 'bad' } }), bars(sorted, { [sorted.length >> 1]: 'done', ...Object.fromEntries(sorted.map((v, i) => [i, isNoise(v) ? 'bad' : undefined])) }, { title: '視窗內排序後（綠：中位數；紅：雜訊）', w: half })], 3);
    }
    const out = mapImg(A, (_, pr, pc) => { const s = winVals(A, pr, pc).sort((a, b) => a - b); return s[s.length >> 1]; });
    const mean = mapImg(A, (_, pr, pc) => winVals(A, pr, pc).reduce((a, b) => a + b, 0) / (2 * rad + 1) ** 2);
    r.snap('對每個像素取中位數完成', [gray(A, '輸入影像'), gray(out, '中值濾波')], 3);
    r.snap(`中值濾波後剩 ${noiseCount(out)} 個雜訊點；平均濾波把雜訊抹成灰色斑點，邊緣也變模糊`, [gray(out, '中值濾波'), gray(mean, '平均濾波（對照）')], 5);
    return r.frames;
  },
};

// ---------------- Sobel ----------------
const sobelOp: AlgoDef = {
  id: 'sobel', name: 'Sobel 梯度', en: 'Sobel Operator', cat,
  desc: '用兩個 3×3 核心近似影像在水平與垂直方向的導數：Gx 偵測左右亮度變化（垂直邊緣），Gy 偵測上下變化（水平邊緣）。核心中間列權重 2，兼具平滑效果。梯度保留正負號：由暗到亮為正、由亮到暗為負（圖中橘為正、藍為負）。強度 |∇| = √(Gx² + Gy²)，方向 θ = atan2(Gy, Gx)。平坦區域的梯度必為 0。',
  time: 'O(HW)', space: 'O(HW)',
  code: ['Kx = [−1 0 1; −2 0 2; −1 0 1]', 'Ky = [−1 −2 −1; 0 0 0; 1 2 1]', 'Gx = Kx ⋆ img，Gy = Ky ⋆ img（保留正負號）', '強度 = √(Gx² + Gy²)', '方向 = atan2(Gy, Gx)', '平坦區域：Gx = Gy = 0'],
  inputs: [imgSelect(['shapes', 'step', 'checker', 'noisy']), borderSelect()],
  run({ img: name, border }) {
    const r = new Rec();
    const A = presetImage(name);
    const mode = border as Border;
    const { gx, gy } = sobel(A, mode);
    const mag = mapImg(gx, (v, i, j) => Math.hypot(v, gy[i][j]));
    r.snap('Sobel 核心：Kx 計算水平變化、Ky 計算垂直變化', [gray(A, '輸入影像'), table([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], {}, { title: 'Kx', w: half }), table([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], {}, { title: 'Ky', w: half })], 1);
    let edge: [number, number] = [8, 8], flat: [number, number] = [0, 0];
    let best = -1;
    for (let i = 1; i < 15; i++) for (let j = 1; j < 15; j++) { if (mag[i][j] > best) { best = mag[i][j]; edge = [i, j]; } }
    for (let i = 1; i < 15; i++) for (let j = 1; j < 15; j++) { const vals = [-1, 0, 1].flatMap((a) => [-1, 0, 1].map((b) => A[i + a][j + b])); if (vals.every((v) => v === vals[0])) { flat = [i, j]; i = 99; break; } }
    for (const [pr, pc] of [edge, flat]) {
      const vals = [-1, 0, 1].map((a) => [-1, 0, 1].map((b) => at(A, pr + a, pc + b, mode)));
      r.snap(`像素 (${pr}, ${pc})：Gx = ${gx[pr][pc]}、Gy = ${gy[pr][pc]}，強度 ${f2(mag[pr][pc])}${gx[pr][pc] === 0 && gy[pr][pc] === 0 ? '（視窗內全部相同 → 平坦區梯度為 0）' : `，方向 ${f2((Math.atan2(gy[pr][pc], gx[pr][pc]) * 180) / Math.PI)}°`}`, [gray(A, '輸入影像', { colors: win(pr, pc, 1) }), table(vals, {}, { title: '視窗', w: half })], 3);
    }
    r.snap('Gx 與 Gy（橘：由暗到亮為正；藍：由亮到暗為負）', [auto(gx, 'Gx'), auto(gy, 'Gy')], 3);
    const flatCnt = mag.flat().filter((v, idx) => { const i = Math.floor(idx / 16), j = idx % 16; if (i < 1 || j < 1 || i > 14 || j > 14) return false; const vals = [-1, 0, 1].flatMap((a) => [-1, 0, 1].map((b) => A[i + a][j + b])); return vals.every((x) => x === vals[0]); }).length;
    const flatZero = mag.flat().every((v, idx) => { const i = Math.floor(idx / 16), j = idx % 16; if (i < 1 || j < 1 || i > 14 || j > 14) return true; const vals = [-1, 0, 1].flatMap((a) => [-1, 0, 1].map((b) => A[i + a][j + b])); return !vals.every((x) => x === vals[0]) || v === 0; });
    r.snap(`梯度強度 √(Gx² + Gy²)：最大 ${f2(imgMax(mag))}；${flatCnt} 個內部平坦像素的梯度${flatZero ? '全部為 0' : '不全為 0！'}`, [gray(A, '輸入影像'), img(mag, { title: '梯度強度', w: half, palette: 'heat', range: [0, imgMax(mag) || 1] })], 4);
    return r.frames;
  },
};

// ---------------- 非極大值抑制 ----------------
const SCORE_BUMPS: [number, number, number][] = [[3, 3, 100], [3, 6, 100], [10, 4, 80], [8, 12, 120], [13, 13, 60]];
const scoreMap = (): Img => {
  const a = mapImg(blank(16, 16), (_, r, c) => Math.round(SCORE_BUMPS.reduce((s, [br, bc, A]) => s + A * Math.exp(-((r - br) ** 2 + (c - bc) ** 2) / 3), 0)));
  for (const [r, c] of [[12, 7], [12, 8], [13, 7], [13, 8]]) a[r][c] = 70;
  return a;
};
const nms: AlgoDef = {
  id: 'nonmaximum-suppression', name: '影像局部非極大值抑制', en: 'Non-maximum Suppression (Local Maxima)', cat,
  desc: '在分數圖（例如角點或邊緣強度）上只保留局部最大值：一個像素必須不小於視窗內所有鄰居，且分數超過門檻才保留，其餘抑制為 0，避免同一個特徵被回報好幾次。相等的峰值（平臺）採用固定規則：只保留光柵順序（由上到下、由左到右）中最早的那一個。注意這是影像上的局部抑制，不是物件偵測中以 IoU 合併框的 NMS。',
  time: 'O(HW·k²)', space: 'O(HW)',
  code: ['for 每個像素 p（分數 ≥ 門檻）:', '  for 視窗內每個鄰居 q:', '    if s[q] > s[p]: 抑制 p', '    if s[q] == s[p] 且 q 在光柵順序中比 p 早: 抑制 p（平臺只留第一個）', '  未被抑制 → 保留 p', '其餘像素一律設為 0'],
  inputs: [inSelect('rad', '視窗', [['1', '3×3'], ['2', '5×5']]), inNum('thr', '門檻', 30, 0, 200, () => rnd.pick([10, 30, 50, 80]))],
  run({ rad: rs, thr }) {
    const r = new Rec();
    const S = scoreMap();
    const rad = Number(rs);
    const kept: [number, number][] = [];
    const sup = new Set<string>();
    const view = (hl: CM = {}) => img(S, { title: '分數圖（數字為分數）', palette: 'heat', range: [0, imgMax(S)], vals: true, cell: 26, colors: hl, marks: kept.map(([a, b]) => ({ r: a, c: b, color: 'done' as Color })) });
    r.snap(`分數圖有 ${SCORE_BUMPS.length} 個峰（其中 (3,3) 與 (3,6) 附近、以及右下的平臺含有相等的值）；門檻 ${thr}`, [view()], 1);
    let shown = 0;
    for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) {
      if (S[i][j] < thr) continue;
      let why = '';
      for (let a = -rad; a <= rad && !why; a++) for (let b = -rad; b <= rad && !why; b++) {
        if (!a && !b) continue;
        const y = i + a, x = j + b;
        if (y < 0 || x < 0 || y > 15 || x > 15) continue;
        if (S[y][x] > S[i][j]) why = `鄰居 (${y}, ${x}) = ${S[y][x]} 更大`;
        else if (S[y][x] === S[i][j] && (a < 0 || (a === 0 && b < 0))) why = `與 (${y}, ${x}) 相等且它在光柵順序中較早`;
      }
      if (why) sup.add(`${i},${j}`);
      else kept.push([i, j]);
      const tie = why.includes('相等');
      if (!why || tie || (shown < 4 && S[i][j] >= imgMax(S) * 0.6)) {
        shown++;
        r.snap(`(${i}, ${j}) = ${S[i][j]}：${why ? `抑制（${why}）` : '不小於視窗內所有鄰居 → 保留'}`, [view({ ...win(i, j, rad, 'compare'), [`${i},${j}`]: why ? 'bad' : 'done' })], why ? (tie ? 4 : 3) : 5);
      }
    }
    const out = mapImg(S, (v, i, j) => (kept.some(([a, b]) => a === i && b === j) ? v : 0));
    r.snap(`保留 ${kept.length} 個局部極大值：${kept.map(([a, b]) => `(${a}, ${b})=${S[a][b]}`).join('、')}；其餘 ${16 * 16 - kept.length} 個像素設為 0`, [img(out, { title: '抑制後', palette: 'heat', range: [0, imgMax(S)], w: half, marks: kept.map(([a, b]) => ({ r: a, c: b, color: 'done' as Color })) }), img(S, { title: '原分數圖', palette: 'heat', range: [0, imgMax(S)], w: half })], 6);
    return r.frames;
  },
};

// ---------------- 結構張量（Harris / Shi–Tomasi 共用） ----------------
function structure(A: Img) {
  const { gx, gy } = sobel(A);
  const Ix = mapImg(gx, (v) => v / 8), Iy = mapImg(gy, (v) => v / 8);
  const Sxx = gaussBlur(mapImg(Ix, (v) => v * v), 1), Syy = gaussBlur(mapImg(Iy, (v) => v * v), 1), Sxy = gaussBlur(mapImg(Ix, (v, i, j) => v * Iy[i][j]), 1);
  return { Ix, Iy, Sxx, Syy, Sxy };
}
const localMax = (R: Img, thr: number, rad = 1) => {
  const out: [number, number][] = [];
  for (let i = 0; i < R.length; i++) for (let j = 0; j < R[0].length; j++) {
    if (R[i][j] <= thr) continue;
    let ok = true;
    for (let a = -rad; a <= rad && ok; a++) for (let b = -rad; b <= rad && ok; b++) {
      if (!a && !b) continue;
      const y = i + a, x = j + b;
      if (y < 0 || x < 0 || y >= R.length || x >= R[0].length) continue;
      if (R[y][x] > R[i][j] || (R[y][x] === R[i][j] && (a < 0 || (a === 0 && b < 0)))) ok = false;
    }
    if (ok) out.push([i, j]);
  }
  return out;
};
export const harrisCorners = (A: Img, k = 0.04) => {
  const { Sxx, Syy, Sxy } = structure(A);
  const R = mapImg(Sxx, (a, i, j) => a * Syy[i][j] - Sxy[i][j] ** 2 - k * (a + Syy[i][j]) ** 2);
  return { R, corners: localMax(R, 0.1 * imgMax(R)) };
};

const harris: AlgoDef = {
  id: 'harris-corner', name: 'Harris 角點偵測', en: 'Harris Corner Detector', cat,
  desc: '在小視窗內，把梯度整理成結構張量 M = [ΣIx² ΣIxIy; ΣIxIy ΣIy²]（以高斯加權）。M 的兩個特徵值描述視窗往各方向移動時亮度變化有多大：兩個都小是平坦區，一大一小是邊緣，兩個都大才是角點。Harris 不直接算特徵值，而用 R = det(M) − k·trace(M)²：R 大於零且很大為角點、R 為負為邊緣、接近零為平坦。最後做非極大值抑制取出角點。',
  time: 'O(HW)', space: 'O(HW)',
  code: ['Ix, Iy = Sobel 梯度', 'Sxx = G ⋆ Ix²，Syy = G ⋆ Iy²，Sxy = G ⋆ IxIy   (高斯加權)', 'R = Sxx·Syy − Sxy² − k·(Sxx + Syy)²', 'R > 門檻：角點；R < 0：邊緣；其餘：平坦', '對 R 做 3×3 非極大值抑制，留下角點'],
  inputs: [imgSelect(['checker', 'shapes', 'step']), inSelect('k', 'k', [['0.04', '0.04'], ['0.06', '0.06']])],
  run({ img: name, k: ks }) {
    const r = new Rec();
    const A = presetImage(name);
    const k = Number(ks);
    const { Ix, Iy, Sxx, Syy, Sxy } = structure(A);
    r.snap('先用 Sobel 求梯度 Ix、Iy（除以 8 讓數值與像素同尺度）', [auto(Ix, 'Ix'), auto(Iy, 'Iy')], 1);
    r.snap('結構張量的三個元素都以高斯 σ = 1 加權平均', [img(Sxx, { title: 'Sxx = G⋆Ix²', palette: 'heat', range: [0, imgMax(Sxx) || 1], w: half }), img(Syy, { title: 'Syy = G⋆Iy²', palette: 'heat', range: [0, imgMax(Syy) || 1], w: half }), auto(Sxy, 'Sxy = G⋆IxIy')], 2);
    const R = mapImg(Sxx, (a, i, j) => a * Syy[i][j] - Sxy[i][j] ** 2 - k * (a + Syy[i][j]) ** 2);
    const maxR = imgMax(R), minR = imgMin(R), thr = 0.1 * maxR;
    r.snap(`R = det − ${k}·trace²：最大 ${maxR.toExponential(2)}，最小 ${minR.toExponential(2)}（橘為正、藍為負）`, [gray(A, '輸入影像'), img(R, { title: 'R', palette: 'signed', range: [minR, maxR], w: half })], 3);
    const cls = mapImg(R, (v) => (v > thr ? 3 : v < 0.1 * minR ? 2 : 1));
    const cnt = (t: number) => cls.flat().filter((v) => v === t).length;
    r.snap(`分類：角點 ${cnt(3)} 個像素（R > 0.1·max）、邊緣 ${cnt(2)} 個（R < 0.1·min，為負）、平坦 ${cnt(1)} 個`, [gray(A, '輸入影像'), img(cls, { title: '1 平坦／2 邊緣／3 角點', palette: 'label', range: [0, 3], w: half })], 4);
    const corners = localMax(R, thr);
    r.snap(`非極大值抑制後得到 ${corners.length} 個角點：${corners.map(([a, b]) => `(${a}, ${b})`).join(' ')}`, [gray(A, '輸入影像與角點', { marks: corners.map(([a, b]) => ({ r: a, c: b, color: 'bad' as Color })) }), img(R, { title: 'R', palette: 'signed', range: [minR, maxR], w: half, marks: corners.map(([a, b]) => ({ r: a, c: b, color: 'done' as Color })) })], 5);
    return r.frames;
  },
};

// ---------------- Shi–Tomasi ----------------
const shiTomasi: AlgoDef = {
  id: 'shi-tomasi', name: 'Shi–Tomasi 角點偵測', en: 'Shi–Tomasi (Good Features to Track)', cat,
  desc: '和 Harris 使用同一個結構張量 M，但分數直接取較小的特徵值 λmin = trace/2 − √((trace/2)² − det)：只有兩個方向都有足夠變化時 λmin 才大，比 Harris 的經驗式更直接。挑點時有兩個參數：品質門檻（λmin 至少為最大值的某個比例）與最小間距（由高分往低分貪婪挑選，太靠近已選點的就跳過）。最後與 Harris 在同一張圖上的結果比較。',
  time: 'O(HW + m log m)', space: 'O(HW)',
  code: ['計算結構張量 Sxx、Syy、Sxy（同 Harris）', 'λmin = (Sxx+Syy)/2 − √(((Sxx−Syy)/2)² + Sxy²)', '候選 = λmin ≥ 品質 × max(λmin) 的像素，依分數由大到小排序', 'for 每個候選 p:', '  if p 與所有已選點的距離 ≥ 最小間距: 選取 p', '  否則跳過（離已選點太近）'],
  inputs: [imgSelect(['checker', 'shapes', 'step']), inSelect('q', '品質門檻', [['0.1', '0.1'], ['0.05', '0.05'], ['0.3', '0.3']]), inSelect('dist', '最小間距', [['3', '3'], ['2', '2'], ['5', '5']])],
  run({ img: name, q, dist }) {
    const r = new Rec();
    const A = presetImage(name);
    const { Sxx, Syy, Sxy } = structure(A);
    const lam = mapImg(Sxx, (a, i, j) => (a + Syy[i][j]) / 2 - Math.sqrt(((a - Syy[i][j]) / 2) ** 2 + Sxy[i][j] ** 2));
    const mx = imgMax(lam), qv = Number(q), md = Number(dist);
    r.snap(`λmin（結構張量較小的特徵值）：最大 ${f2(mx)}`, [gray(A, '輸入影像'), img(lam, { title: 'λmin', palette: 'heat', range: [0, mx || 1], w: half })], 2);
    const cand: [number, number][] = [];
    for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) if (lam[i][j] >= qv * mx && mx > 0) cand.push([i, j]);
    cand.sort((a, b) => lam[b[0]][b[1]] - lam[a[0]][a[1]] || a[0] - b[0] || a[1] - b[1]);
    r.snap(`品質門檻 ${qv} × ${f2(mx)} = ${f2(qv * mx)}：${cand.length} 個候選像素，依 λmin 由大到小排序`, [gray(A, '候選', { colors: Object.fromEntries(cand.map(([a, b]) => [`${a},${b}`, 'frontier' as Color])) }), img(lam, { title: 'λmin', palette: 'heat', range: [0, mx || 1], w: half })], 3);
    const chosen: [number, number][] = [];
    let shown = 0;
    for (const [a, b] of cand) {
      const near = chosen.find(([y, x]) => Math.hypot(y - a, x - b) < md);
      if (!near) chosen.push([a, b]);
      if (shown < 14) { shown++; r.snap(`(${a}, ${b}) λmin = ${f2(lam[a][b])}：${near ? `距離已選的 (${near[0]}, ${near[1]}) 小於 ${md}，跳過` : '選取'}`, [gray(A, '已選的點', { marks: chosen.map(([y, x]) => ({ r: y, c: x, color: 'done' as Color })), colors: { [`${a},${b}`]: near ? 'bad' : 'done' } })], near ? 6 : 5); }
    }
    const H = harrisCorners(A).corners;
    const common = chosen.filter(([a, b]) => H.some(([y, x]) => Math.hypot(y - a, x - b) <= 1)).length;
    r.snap(`Shi–Tomasi 選出 ${chosen.length} 點；Harris 找到 ${H.length} 點，其中 ${common} 個 Shi–Tomasi 點與 Harris 點相距 ≤ 1`, [gray(A, 'Shi–Tomasi', { marks: chosen.map(([y, x]) => ({ r: y, c: x, color: 'done' as Color })) }), gray(A, 'Harris', { marks: H.map(([y, x]) => ({ r: y, c: x, color: 'bad' as Color })) })], 5);
    return r.frames;
  },
};

// ---------------- Canny ----------------
const canny: AlgoDef = {
  id: 'canny', name: 'Canny 邊緣偵測', en: 'Canny Edge Detector', cat,
  desc: '經典的多階段邊緣偵測：①高斯模糊去雜訊；②Sobel 求梯度強度與方向；③沿梯度方向做非極大值抑制，把粗邊緣細化成一個像素寬；④雙門檻：高於高門檻為強邊、介於兩者為弱邊；⑤滯後連結：從強邊出發做 BFS，只有連得到強邊的弱邊才保留，孤立的弱邊（多半是雜訊）丟掉。',
  time: 'O(HW)', space: 'O(HW)',
  code: ['B = 高斯模糊(img)', 'Gx, Gy = Sobel(B)；強度 M、方向 θ', '細化：M[p] 不大於梯度方向兩側的鄰居 → 設為 0', '強邊：M ≥ 高門檻；弱邊：低門檻 ≤ M < 高門檻', '佇列 = 所有強邊；BFS：8 鄰居中的弱邊 → 升為強邊並入列', '未連到強邊的弱邊丟棄'],
  inputs: [imgSelect(['shapes', 'noisy', 'step']), inSelect('th', '門檻（相對最大強度）', [['0.15,0.4', '低 0.15、高 0.4'], ['0.1,0.3', '低 0.1、高 0.3'], ['0.25,0.5', '低 0.25、高 0.5']])],
  run({ img: name, th }) {
    const r = new Rec();
    const A = presetImage(name);
    const [lo, hi] = String(th).split(',').map(Number);
    const B = gaussBlur(A, 1);
    r.snap('①高斯模糊（σ = 1）去除雜訊', [gray(A, '輸入影像'), gray(B, '模糊後', { range: [0, 255] })], 1);
    const { gx, gy } = sobel(B);
    const M = mapImg(gx, (v, i, j) => Math.hypot(v, gy[i][j]));
    const mx = imgMax(M) || 1;
    r.snap('②Sobel 梯度強度', [gray(B, '模糊後', { range: [0, 255] }), img(M, { title: '梯度強度', palette: 'heat', range: [0, mx], w: half })], 2);
    const thin = mapImg(M, (v, i, j) => {
      let ang = (Math.atan2(gy[i][j], gx[i][j]) * 180) / Math.PI;
      if (ang < 0) ang += 180;
      const [di, dj] = ang < 22.5 || ang >= 157.5 ? [0, 1] : ang < 67.5 ? [1, 1] : ang < 112.5 ? [1, 0] : [1, -1];
      const n1 = i + di >= 0 && i + di < 16 && j + dj >= 0 && j + dj < 16 ? M[i + di][j + dj] : 0;
      const n2 = i - di >= 0 && i - di < 16 && j - dj >= 0 && j - dj < 16 ? M[i - di][j - dj] : 0;
      return v >= n1 && v >= n2 ? v : 0;
    });
    r.snap(`③沿梯度方向（量化成 0°、45°、90°、135°）非極大值抑制：非零像素從 ${M.flat().filter((v) => v > 0).length} 個減為 ${thin.flat().filter((v) => v > 0).length} 個`, [img(M, { title: '細化前', palette: 'heat', range: [0, mx], w: half }), img(thin, { title: '細化後', palette: 'heat', range: [0, mx], w: half })], 3);
    const tl = lo * mx, thh = hi * mx;
    const lab = mapImg(thin, (v) => (v >= thh ? 2 : v >= tl ? 1 : 0));
    const strong0 = lab.flat().filter((v) => v === 2).length, weak0 = lab.flat().filter((v) => v === 1).length;
    const show = () => img(mapImg(lab, (v) => (v === 2 ? 1 : v === 1 ? 4 : v === 3 ? 2 : 0)), { title: '紅：強邊／黃：弱邊／青：剛連上的', palette: 'label', range: [0, 4], w: half });
    r.snap(`④雙門檻：強邊（≥ ${f2(thh)}）${strong0} 個、弱邊（${f2(tl)}–${f2(thh)}）${weak0} 個`, [gray(A, '輸入影像'), show()], 4);
    let queue: [number, number][] = [];
    lab.forEach((row, i) => row.forEach((v, j) => { if (v === 2) queue.push([i, j]); }));
    let wave = 0, promoted = 0;
    while (queue.length) {
      const next: [number, number][] = [];
      for (const [i, j] of queue) for (const [a, b] of N8) { const y = i + a, x = j + b; if (y >= 0 && x >= 0 && y < 16 && x < 16 && lab[y][x] === 1) { lab[y][x] = 3; next.push([y, x]); promoted++; } }
      if (!next.length) break;
      wave++;
      r.snap(`⑤滯後連結第 ${wave} 層：${next.length} 個弱邊與強邊相連，升為強邊`, [gray(A, '輸入影像'), show()], 5);
      next.forEach(([y, x]) => { lab[y][x] = 2; });
      queue = next;
    }
    const dropped = lab.flat().filter((v) => v === 1).length;
    const edges = mapImg(lab, (v) => (v === 2 ? 255 : 0));
    r.snap(`完成：保留 ${strong0 + promoted} 個邊緣像素（${promoted} 個由弱邊升級），丟掉 ${dropped} 個沒連到強邊的弱邊`, [gray(A, '輸入影像'), gray(edges, 'Canny 邊緣')], 6);
    return r.frames;
  },
};

// ---------------- 大津二值化 ----------------
const otsu: AlgoDef = {
  id: 'otsu', name: '大津二值化', en: "Otsu's Thresholding", cat,
  desc: '自動找出最佳門檻 t，把像素分成「≤ t」與「> t」兩類。對每個可能的 t，計算兩類的權重 ω₀、ω₁ 與平均 μ₀、μ₁，類間變異數 σ²_B = ω₀ω₁(μ₀ − μ₁)²；讓它最大的 t 使兩類分得最開。用累積和可以 O(256) 掃完所有 t。某一類沒有像素時跳過（不除以零）；影像只有一種灰階時沒有兩類可分，規定 t 等於該灰階、全部歸為背景。',
  time: 'O(HW + L)，L = 256', space: 'O(L)',
  code: ['hist = 灰階直方圖，N = 像素總數', 'for t = 0 .. 255:', '  ω₀ = Σ_{v≤t} hist[v] / N，ω₁ = 1 − ω₀', '  if ω₀ == 0 或 ω₁ == 0: 跳過（空類別）', '  μ₀、μ₁ = 兩類的平均灰階', '  σ²_B = ω₀·ω₁·(μ₀ − μ₁)²，記錄最大者', '只有一種灰階：t = 該灰階，全部為背景', '二值化：v > t → 前景'],
  inputs: [inSelect('img', '測試影像', [['shapes', '幾何圖形'], ['lowcontrast', '低對比'], ['noisy', '圖形＋椒鹽雜訊'], ['step', '階梯邊緣'], ['flat', '全部同一灰階']])],
  run({ img: name }) {
    const r = new Rec();
    const A = name === 'flat' ? flatImg() : presetImage(name);
    const N = 256;
    const h = histogram(A);
    const bins32 = Array.from({ length: 32 }, (_, i) => h.slice(i * 8, i * 8 + 8).reduce((a, b) => a + b, 0));
    const histPanel = (t?: number): Panel => bars(bins32, t === undefined ? {} : Object.fromEntries(bins32.map((_, i) => [i, i * 8 + 7 <= t ? 'active' : 'frontier'] as [number, Color])), { title: '直方圖（每 8 個灰階一格；藍：≤ t，青：> t）', labels: bins32.map((_, i) => (i % 4 ? '' : String(i * 8))), w: half });
    r.snap(`${N} 個像素、${h.filter((v) => v).length} 種灰階`, [gray(A, '輸入影像'), histPanel()], 1);
    const levels = h.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
    if (levels.length === 1) {
      r.snap(`影像只有一種灰階 ${levels[0]}：任何門檻都會讓其中一類為空，依規定 t = ${levels[0]}，全部歸為背景`, [gray(A, '輸入影像'), gray(blank(16, 16, 0), '二值化結果'), vars({ t: levels[0] })], 7);
      return r.frames;
    }
    let w0 = 0, sum0 = 0, best = -1, bt = 0;
    const total = h.reduce((s, c, v) => s + c * v, 0);
    const curve: [number, number][] = [];
    for (let t = 0; t < 256; t++) {
      w0 += h[t]; sum0 += h[t] * t;
      const w1 = N - w0;
      if (!w0 || !w1) continue;
      const m0 = sum0 / w0, m1 = (total - sum0) / w1;
      const sb = (w0 / N) * (w1 / N) * (m0 - m1) ** 2;
      curve.push([t, sb]);
      if (sb > best) { best = sb; bt = t; }
      if (h[t] && levels.includes(t) && t < levels[levels.length - 1]) r.snap(`t = ${t}：ω₀ = ${f2(w0 / N)}、ω₁ = ${f2(w1 / N)}、μ₀ = ${f2(m0)}、μ₁ = ${f2(m1)} → σ²_B = ${f2(sb)}${sb === best ? '（目前最大）' : ''}`, [histPanel(t), { type: 'plot', axes: true, bounds: [0, 255, 0, Math.max(...curve.map((p) => p[1])) * 1.1 || 1], curves: [{ pts: [...curve], color: 'active', width: 2 }], points: [{ x: t, y: sb, color: 'bad', r: 5 }], title: '類間變異數 σ²_B(t)', w: half }], 6);
    }
    const bin = mapImg(A, (v) => (v > bt ? 255 : 0));
    r.snap(`最佳門檻 t = ${bt}（σ²_B = ${f2(best)}）；空類別的 t 已跳過。v > ${bt} 的 ${bin.flat().filter((v) => v).length} 個像素為前景`, [gray(A, '輸入影像'), gray(bin, `二值化（t = ${bt}）`), histPanel(bt)], 8);
    return r.frames;
  },
};

// ---------------- 直方圖均衡化 ----------------
const histEq: AlgoDef = {
  id: 'histogram-equalization', name: '直方圖均衡化', en: 'Histogram Equalization', cat,
  desc: '低對比影像的灰階擠在一小段範圍。均衡化用累積分布函數 CDF 當作對應表：v ↦ round((CDF(v) − CDF_min) / (N − CDF_min) × 255)，讓輸出灰階盡量均勻散開到 0–255。CDF 就是直方圖的前綴和。常數影像的 N − CDF_min = 0，依規定不做任何改變；四捨五入可能讓兩個灰階合併，但順序不會顛倒。',
  time: 'O(HW + L)', space: 'O(L)',
  code: ['hist = 灰階直方圖', 'CDF[v] = hist[0] + … + hist[v]   (前綴和)', 'CDF_min = 第一個非零的 CDF', 'if N == CDF_min: 常數影像，原樣輸出', 'map[v] = round((CDF[v] − CDF_min) / (N − CDF_min) × 255)', 'out[p] = map[img[p]]'],
  inputs: [inSelect('img', '測試影像', [['lowcontrast', '低對比'], ['shapes', '幾何圖形'], ['flat', '全部同一灰階']])],
  run({ img: name }) {
    const r = new Rec();
    const A = name === 'flat' ? flatImg() : presetImage(name);
    const N = 256;
    const h = histogram(A);
    const b32 = (hh: number[]) => Array.from({ length: 32 }, (_, i) => hh.slice(i * 8, i * 8 + 8).reduce((a, b) => a + b, 0));
    const hp = (hh: number[], title: string) => bars(b32(hh), {}, { title, labels: b32(hh).map((_, i) => (i % 4 ? '' : String(i * 8))), w: half });
    const used = h.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
    r.snap(`灰階只分布在 ${used[0]}–${used[used.length - 1]}（${used.length} 種）`, [gray(A, '輸入影像'), hp(h, '輸入直方圖')], 1);
    const cdf: number[] = [];
    h.reduce((s, v, i) => (cdf[i] = s + v), 0);
    const cmin = cdf.find((v) => v > 0)!;
    const rows = used.map((v) => [v, h[v], cdf[v]]);
    r.snap(`前綴和得到 CDF；CDF_min = ${cmin}`, [table(rows, {}, { title: '灰階、個數、CDF', colHeaders: ['v', 'hist', 'CDF'], w: half }), hp(h, '輸入直方圖')], 3);
    if (N === cmin) { r.snap(`N = CDF_min = ${N}：常數影像，分母為 0，依規定原樣輸出`, [gray(A, '輸入影像'), gray(A, '輸出（不變）')], 4); return r.frames; }
    const map = cdf.map((c) => Math.round(((c - cmin) / (N - cmin)) * 255));
    r.snap('對應表 map[v] = round((CDF − CDF_min)/(N − CDF_min) × 255)', [table(used.map((v) => [v, cdf[v], map[v]]), {}, { title: '對應表', colHeaders: ['v', 'CDF', 'map[v]'], w: half }), { type: 'plot', axes: true, bounds: [0, 255, 0, 255], curves: [{ pts: used.map((v) => [v, map[v]] as [number, number]), color: 'active', width: 2 }], title: '輸入灰階 → 輸出灰階', w: half }], 5);
    const out = mapImg(A, (v) => map[v]);
    const ho = histogram(out);
    const outLevels = ho.filter((v) => v).length;
    r.snap(`均衡化後灰階分布在 ${imgMin(out)}–${imgMax(out)}；${used.length} 種灰階對應到 ${outLevels} 種${outLevels < used.length ? '（四捨五入合併了一些）' : ''}，順序保持不變`, [gray(A, '輸入影像'), gray(out, '均衡化後'), hp(h, '輸入直方圖'), hp(ho, '輸出直方圖')], 6);
    return r.frames;
  },
};

export default [convolution, gaussian, median, sobelOp, nms, harris, shiTomasi, canny, otsu, histEq];
