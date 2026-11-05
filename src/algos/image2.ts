// 影像處理（二）：局部均衡、形態學、區域、直線、光流、距離、分割與縮放
import type { AlgoDef, Color, Panel, PlotPanel } from '../core/types';
import { Rec, bars, img, inNum, inSelect, inText, rnd, table, text, vars } from '../core/helpers';
import { parkMiller } from '../core/extra';
import { type Img, N4, N8, blank, gaussBlur, histogram, imgMax, imgMin, mapImg, presetImage, sobel, toBinary } from '../core/imagelib';

const cat = 'image';
type CM = Record<string, Color | undefined>;
type Pt = [number, number];
const half = 'half' as const;
const gray = (a: Img, title: string, o: Partial<Parameters<typeof img>[1]> = {}) => img(a, { title, w: half, ...o });
const labels = (a: Img, title: string, o: Partial<Parameters<typeof img>[1]> = {}) => img(a, { title, w: half, palette: 'label', range: [0, Math.max(1, imgMax(a))], ...o });
const f2 = (v: number) => { const x = +v.toFixed(2); return Math.abs(x) < 1e-9 ? 0 : x; };
const inside = (a: Img, r: number, c: number) => r >= 0 && c >= 0 && r < a.length && c < a[0].length;

// ---------------- CLAHE ----------------
const clahe: AlgoDef = {
  id: 'clahe', name: '對比限制自適應直方圖均衡化', en: 'CLAHE', cat,
  desc: '全域均衡化只用一張對應表，局部細節常被忽略；把影像切成小格（tile）各自均衡化，能拉出局部對比，但雜訊也會被放大。CLAHE 兩個改進：①對比限制——每格的直方圖先把超過上限的部分裁掉，平均分回所有灰階（總數不變），限制對應曲線的斜率；②雙線性內插——每個像素用最近四個格子中心的對應結果加權平均，消除格子之間的接縫。',
  time: 'O(HW + T·L)', space: 'O(T·L)',
  code: ['把影像切成 t×t 個格子', 'for 每個格子: hist = 該格直方圖', '  超過上限的部分裁掉，excess 平均分給 256 個灰階（餘數依序給前面的灰階）', '  檢查：裁切再分配後總數 = 格子像素數', '  map_tile[v] = round(CDF[v] × 255 / 格子像素數)', '每個像素：取最近四個格子中心的 map，依距離雙線性內插', '不內插（直接用所在格子的 map）會出現明顯接縫'],
  inputs: [inSelect('img', '測試影像', [['lowcontrast', '低對比'], ['shapes', '幾何圖形']]), inSelect('tiles', '格子數', [['2', '2×2（每格 8×8）'], ['4', '4×4（每格 4×4）']]), inSelect('clip', '裁切上限（倍數 × 平均每灰階個數，至少 1）', [['8', '8 倍'], ['4', '4 倍'], ['32', '32 倍（幾乎不裁切）']])],
  run({ img: name, tiles, clip }) {
    const r = new Rec();
    const A = presetImage(name);
    const T = Number(tiles), ts = 16 / T, P = ts * ts;
    const limit = Math.max(1, Math.ceil((Number(clip) * P) / 256));
    const tileOutline = (ti: number, tj: number): CM => { const o: CM = {}; for (let i = 0; i < ts; i++) for (let j = 0; j < ts; j++) o[`${ti * ts + i},${tj * ts + j}`] = 'swap'; return o; };
    r.snap(`切成 ${T}×${T} 個格子，每格 ${ts}×${ts} = ${P} 像素；裁切上限 = ${limit}`, [gray(A, '輸入影像')], 1);
    const maps: number[][][] = [];
    for (let ti = 0; ti < T; ti++) {
      maps.push([]);
      for (let tj = 0; tj < T; tj++) {
        const h = new Array(256).fill(0);
        for (let i = 0; i < ts; i++) for (let j = 0; j < ts; j++) h[A[ti * ts + i][tj * ts + j]]++;
        let excess = 0;
        const hc = h.map((v) => { if (v > limit) { excess += v - limit; return limit; } return v; });
        const each = Math.floor(excess / 256), rem = excess % 256;
        const hr = hc.map((v, i) => v + each + (i < rem ? 1 : 0));
        const total = hr.reduce((a, b) => a + b, 0);
        let s = 0;
        const map = hr.map((v) => { s += v; return Math.round((s * 255) / P); });
        maps[ti].push(map);
        if (ti === 0 && tj === 0 || (ti === T - 1 && tj === T - 1)) {
          const used = h.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
          r.snap(`格子 (${ti}, ${tj})：${used.length} 種灰階，最高的有 ${Math.max(...h)} 個；裁掉 ${excess} 個再平均分回（每個灰階 +${each}，前 ${rem} 個再 +1），總數 ${total} ${total === P ? '= 像素數 ✓' : '≠ 像素數！'}`, [gray(A, '輸入影像', { colors: tileOutline(ti, tj) }), table(used.map((v) => [v, h[v], hc[v], map[v]]), {}, { title: '灰階、原個數、裁切後、map', colHeaders: ['v', 'hist', '裁切', 'map'], w: half })], 4);
        }
      }
    }
    const noInterp = mapImg(A, (v, i, j) => maps[Math.floor(i / ts)][Math.floor(j / ts)][v]);
    r.snap('不內插：每個像素直接用所在格子的對應表，格子交界處出現明顯接縫', [gray(A, '輸入影像'), gray(noInterp, '各格獨立均衡（有接縫）')], 7);
    const out = mapImg(A, (v, i, j) => {
      const fy = (i + 0.5) / ts - 0.5, fx = (j + 0.5) / ts - 0.5;
      const y0 = Math.max(0, Math.min(T - 1, Math.floor(fy))), x0 = Math.max(0, Math.min(T - 1, Math.floor(fx)));
      const y1 = Math.min(T - 1, y0 + 1), x1 = Math.min(T - 1, x0 + 1);
      const wy = Math.max(0, Math.min(1, fy - y0)), wx = Math.max(0, Math.min(1, fx - x0));
      return Math.round((1 - wy) * ((1 - wx) * maps[y0][x0][v] + wx * maps[y0][x1][v]) + wy * ((1 - wx) * maps[y1][x0][v] + wx * maps[y1][x1][v]));
    });
    const h = histogram(A);
    let s = 0;
    const cmin = h.find((v) => v > 0)!;
    const glob = h.map((v) => { s += v; return 256 === cmin ? 0 : Math.round(((s - cmin) / (256 - cmin)) * 255); });
    const seam = (a: Img) => { let d = 0; for (let k = 1; k < T; k++) for (let i = 0; i < 16; i++) d += Math.abs(a[i][k * ts] - a[i][k * ts - 1]) + Math.abs(a[k * ts][i] - a[k * ts - 1][i]); return d; };
    r.snap(`雙線性內插：每個像素混合最近四個格子的結果。格線兩側的亮度差總和：不內插 ${seam(noInterp)}、內插 ${seam(out)}`, [gray(noInterp, '不內插'), gray(out, 'CLAHE（內插）'), gray(mapImg(A, (v) => glob[v]), '全域均衡化（對照）')], 6);
    return r.frames;
  },
};

// ---------------- 形態學 ----------------
const noisyBin = (): Img => { const a = toBinary(presetImage('blobs')), g = parkMiller(5); return mapImg(a, (v) => { const t = g.int(100); return t < 6 ? 1 - v : v; }); };
const morphology: AlgoDef = {
  id: 'morphology', name: '形態學侵蝕與膨脹', en: 'Morphology: Erosion & Dilation', cat,
  desc: '在二值影像上用一個結構元素（小形狀）掃過每個像素。侵蝕：結構元素蓋到的位置必須全部是前景，中心才保留——物體縮小、細小雜點消失。膨脹：只要蓋到任何前景，中心就變成前景——物體變大、小洞被填滿。開運算 = 先侵蝕再膨脹（去掉小雜點、大致保留形狀），閉運算 = 先膨脹再侵蝕（填補小洞）。邊界外一律視為背景 0。',
  time: 'O(HW·k)', space: 'O(HW)',
  code: ['侵蝕：out[p] = 1 ⇔ 結構元素蓋到的每一格都是 1', '膨脹：out[p] = 1 ⇔ 結構元素蓋到至少一格是 1', '邊界外的格子一律視為 0（背景）', '開運算 = 膨脹(侵蝕(img))', '閉運算 = 侵蝕(膨脹(img))'],
  inputs: [inSelect('img', '測試影像', [['noisybin', '圓斑＋雜點（二值）'], ['blobs', '相鄰圓斑（二值）']]), inSelect('op', '運算', [['open', '開運算（先侵蝕再膨脹）'], ['close', '閉運算（先膨脹再侵蝕）'], ['erode', '侵蝕'], ['dilate', '膨脹']]), inSelect('se', '結構元素', [['square', '3×3 方形'], ['cross', '十字（4 鄰居 + 中心）']])],
  run({ img: name, op, se }) {
    const r = new Rec();
    const A = name === 'noisybin' ? noisyBin() : toBinary(presetImage('blobs'));
    const S: Pt[] = se === 'square' ? [[0, 0], ...N8] : [[0, 0], ...N4];
    const apply = (a: Img, kind: 'erode' | 'dilate', label: string) => {
      const out = blank(16, 16);
      for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
          const vals = S.map(([y, x]) => (inside(a, i + y, j + x) ? a[i + y][j + x] : 0));
          out[i][j] = kind === 'erode' ? (vals.every((v) => v) ? 1 : 0) : vals.some((v) => v) ? 1 : 0;
        }
      }
      const demo = (() => { for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) if (a[i][j] !== out[i][j]) return [i, j] as Pt; return null; })();
      if (demo) {
        const [i, j] = demo;
        const cover: CM = Object.fromEntries(S.map(([y, x]) => [`${i + y},${j + x}`, 'swap' as Color]));
        r.snap(`${label}：像素 (${i}, ${j}) 原本 ${a[i][j]}，結構元素蓋到 ${S.map(([y, x]) => (inside(a, i + y, j + x) ? a[i + y][j + x] : 0)).join('')}（邊界外算 0）→ ${out[i][j]}`, [labels(a, '處理前', { colors: cover }), labels(out, '處理後', { colors: { [`${i},${j}`]: 'bad' } })], kind === 'erode' ? 1 : 2);
      }
      const fg = (x: Img) => x.flat().filter((v) => v).length;
      r.snap(`${label}完成：前景 ${fg(a)} → ${fg(out)} 個像素`, [labels(a, '處理前'), labels(out, `${label}後`)], kind === 'erode' ? 1 : 2);
      return out;
    };
    r.snap(`二值影像：前景 ${A.flat().filter((v) => v).length} 個像素；結構元素 ${se === 'square' ? '3×3 方形' : '十字'}`, [labels(A, '輸入（二值）')], 3);
    let out: Img;
    if (op === 'erode') out = apply(A, 'erode', '侵蝕');
    else if (op === 'dilate') out = apply(A, 'dilate', '膨脹');
    else if (op === 'open') out = apply(apply(A, 'erode', '侵蝕'), 'dilate', '膨脹');
    else out = apply(apply(A, 'dilate', '膨脹'), 'erode', '侵蝕');
    const comps = (x: Img) => { const seen = mapImg(x, () => 0); let n = 0; x.forEach((row, i) => row.forEach((v, j) => { if (!v || seen[i][j]) return; n++; const st: Pt[] = [[i, j]]; seen[i][j] = 1; while (st.length) { const [y, z] = st.pop()!; for (const [a, b] of N4) { if (inside(x, y + a, z + b) && x[y + a][z + b] && !seen[y + a][z + b]) { seen[y + a][z + b] = 1; st.push([y + a, z + b]); } } } })); return n; };
    r.snap(`${{ open: '開運算', close: '閉運算', erode: '侵蝕', dilate: '膨脹' }[op as string]}結果：前景連通塊 ${comps(A)} → ${comps(out)} 個`, [labels(A, '輸入'), labels(out, '結果')], op === 'open' ? 4 : op === 'close' ? 5 : 1);
    return r.frames;
  },
};

// ---------------- 洪水填色 ----------------
const fillGrid = (): Img => {
  const a = blank(12, 12, 1);
  for (let i = 2; i <= 9; i++) for (let j = 2; j <= 9; j++) if (i === 2 || i === 9 || j === 2 || j === 9) a[i][j] = 2;
  a[2][2] = 1;
  for (let i = 5; i <= 6; i++) for (let j = 5; j <= 6; j++) a[i][j] = 3;
  return a;
};
const floodFill: AlgoDef = {
  id: 'flood-fill', name: '洪水填色', en: 'Flood Fill (BFS)', cat,
  desc: '從種子像素出發，把所有與它相連、顏色相同的像素換成新顏色（小畫家的油漆桶）。用 BFS：佇列放入種子，每次取出一格並檢查鄰居，顏色等於舊色就塗上新色並入列。「相連」有兩種定義：4 鄰接只看上下左右，8 鄰接連斜角也算——預設圖中外框左上角缺了一格，內部只能「斜著」碰到外面，所以 8 鄰接會漏出去、4 鄰接不會。若新顏色等於舊顏色，什麼都不用做，直接結束（否則會無限循環）。',
  time: 'O(HW)', space: 'O(HW)',
  code: ['old = img[seed]', 'if old == new: return（避免無限循環）', 'img[seed] = new；queue = [seed]', 'while queue 不空:', '  p = queue.pop_front()', '  for p 的每個鄰居 q（4 或 8 鄰接）:', '    if img[q] == old: img[q] = new；queue.push(q)'],
  inputs: [inText('seed', '種子（列 行）', '4 4', () => `${rnd.int(0, 11)} ${rnd.int(0, 11)}`), inSelect('conn', '鄰接', [['4', '4 鄰接（上下左右）'], ['8', '8 鄰接（含斜角）']]), inSelect('color', '新顏色', [['4', '色 4'], ['5', '色 5'], ['1', '色 1'], ['2', '色 2']])],
  run({ seed, conn, color }) {
    const r = new Rec();
    const A = fillGrid();
    const [sr, sc] = String(seed).split(/[\s,]+/).map(Number);
    if (!inside(A, sr, sc)) throw new Error('種子必須在 0–11 範圍內');
    const nw = Number(color), old = A[sr][sc];
    const nb = conn === '8' ? N8 : N4;
    const view = (hl: CM = {}) => img(A, { title: '影像（數字為顏色編號）', palette: 'label', range: [0, 5], vals: true, cell: 28, colors: hl });
    r.snap(`種子 (${sr}, ${sc}) 的顏色是 ${old}，要塗成 ${nw}（${conn} 鄰接）`, [view({ [`${sr},${sc}`]: 'swap' })], 1);
    if (old === nw) { r.snap(`新顏色與舊顏色相同：不需要任何改變，直接結束（若照常 BFS，塗完的格子仍等於舊色，會一直重複入列）`, [view({ [`${sr},${sc}`]: 'swap' })], 2); return r.frames; }
    A[sr][sc] = nw;
    let layer: Pt[] = [[sr, sc]];
    let count = 1, depth = 0;
    while (layer.length) {
      const next: Pt[] = [];
      for (const [i, j] of layer) for (const [a, b] of nb) { const y = i + a, x = j + b; if (inside(A, y, x) && A[y][x] === old) { A[y][x] = nw; next.push([y, x]); count++; } }
      if (!next.length) break;
      depth++;
      r.snap(`第 ${depth} 層：${next.length} 個相連的「${old}」被塗成 ${nw}（累計 ${count}）`, [view(Object.fromEntries(next.map(([y, x]) => [`${y},${x}`, 'swap' as Color])))], 7);
      layer = next;
    }
    r.snap(`完成：共塗了 ${count} 格${conn === '8' && old === 1 && count > 40 ? '。8 鄰接時內部經由左上角的斜縫和外面連在一起' : ''}`, [view()], 4);
    return r.frames;
  },
};

// ---------------- 連通元件標記 ----------------
const diagBin = (): Img => mapImg(blank(16, 16), (_, i, j) => ((i + j) % 4 === 0 && i % 2 === 0) || (i >= 10 && j >= 10 && (i + j) % 2 === 0) ? 1 : 0);
const components: AlgoDef = {
  id: 'image-components', name: '連通元件標記', en: 'Connected-component Labeling (Two-pass + Union-Find)', cat,
  desc: '找出二值影像中每一塊相連的前景並編號。兩趟掃描法：第一趟依光柵順序看每個前景像素已經掃過的鄰居（4 鄰接看上和左，8 鄰接再加左上、右上）——沒有標籤就給新標籤，有多個不同標籤就用並查集把它們合併；第二趟把每個暫時標籤換成並查集的代表。結果與直接 BFS 分群比對。4 與 8 鄰接會得到不同的塊數。',
  time: 'O(HW·α(HW))', space: 'O(HW)',
  code: ['第一趟（光柵順序）:', '  for 每個前景像素 p:', '    nbr = 已掃過的鄰居中有標籤者', '    if nbr 為空: p 取得新標籤', '    else: p = min(nbr)；union(nbr 中所有標籤)', '第二趟：label[p] = find(label[p])，再重新編號為 1, 2, …', '驗證：與 BFS 分群的結果一致'],
  inputs: [inSelect('img', '測試影像', [['noisybin', '圓斑＋雜點（二值）'], ['blobs', '相鄰圓斑（二值）'], ['diag', '斜向相接的點（二值）']]), inSelect('conn', '鄰接', [['4', '4 鄰接'], ['8', '8 鄰接']])],
  run({ img: name, conn }) {
    const r = new Rec();
    const A = name === 'noisybin' ? noisyBin() : name === 'diag' ? diagBin() : toBinary(presetImage('blobs'));
    const prev: Pt[] = conn === '8' ? [[-1, -1], [-1, 0], [-1, 1], [0, -1]] : [[-1, 0], [0, -1]];
    const lab = blank(16, 16);
    const parent: number[] = [0];
    const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    const unions: string[] = [];
    r.snap(`二值影像，前景 ${A.flat().filter((v) => v).length} 個像素；${conn} 鄰接`, [labels(A, '輸入')], 1);
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 16; j++) {
        if (!A[i][j]) continue;
        const nbr = prev.map(([a, b]) => (inside(A, i + a, j + b) ? lab[i + a][j + b] : 0)).filter((v) => v);
        if (!nbr.length) { parent.push(parent.length); lab[i][j] = parent.length - 1; }
        else {
          lab[i][j] = Math.min(...nbr);
          for (const v of nbr) { const ra = find(v), rb = find(lab[i][j]); if (ra !== rb) { parent[Math.max(ra, rb)] = Math.min(ra, rb); unions.push(`${Math.max(ra, rb)}→${Math.min(ra, rb)}`); } }
        }
      }
      if (i % 4 === 3) r.snap(`第一趟掃到第 ${i} 列：已發出 ${parent.length - 1} 個暫時標籤，合併 ${unions.length} 次${unions.length ? `（最近：${unions.slice(-4).join('、')}）` : ''}`, [labels(lab, '暫時標籤'), text([`並查集 parent：${parent.slice(1).map((p, k) => `${k + 1}→${p}`).join(' ')}`], '等價關係')], 5);
    }
    const remap = new Map<number, number>();
    const final = mapImg(lab, (v) => { if (!v) return 0; const rt = find(v); if (!remap.has(rt)) remap.set(rt, remap.size + 1); return remap.get(rt)!; });
    r.snap(`第二趟：${parent.length - 1} 個暫時標籤經並查集合併成 ${remap.size} 個元件`, [labels(lab, '暫時標籤'), labels(final, '最終標籤')], 6);
    const nb = conn === '8' ? N8 : N4;
    const bfs = blank(16, 16);
    let cnt = 0;
    for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) {
      if (!A[i][j] || bfs[i][j]) continue;
      cnt++;
      const q: Pt[] = [[i, j]];
      bfs[i][j] = cnt;
      while (q.length) { const [y, x] = q.shift()!; for (const [a, b] of nb) if (inside(A, y + a, x + b) && A[y + a][x + b] && !bfs[y + a][x + b]) { bfs[y + a][x + b] = cnt; q.push([y + a, x + b]); } }
    }
    const pairOk = new Map<number, number>();
    let same = cnt === remap.size;
    for (let i = 0; i < 16 && same; i++) for (let j = 0; j < 16 && same; j++) { if (!final[i][j]) continue; const m = pairOk.get(final[i][j]); if (m === undefined) pairOk.set(final[i][j], bfs[i][j]); else if (m !== bfs[i][j]) same = false; }
    const other = conn === '8' ? N4 : N8;
    const cnt2 = (() => { const s = blank(16, 16); let c = 0; for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) { if (!A[i][j] || s[i][j]) continue; c++; const st: Pt[] = [[i, j]]; s[i][j] = 1; while (st.length) { const [y, x] = st.pop()!; for (const [a, b] of other) if (inside(A, y + a, x + b) && A[y + a][x + b] && !s[y + a][x + b]) { s[y + a][x + b] = 1; st.push([y + a, x + b]); } } } return c; })();
    r.snap(`共 ${remap.size} 個連通元件；BFS 分群得到 ${cnt} 個，分組${same ? '完全一致' : '不一致！'}。改用 ${conn === '8' ? 4 : 8} 鄰接則是 ${cnt2} 個`, [labels(final, '兩趟掃描'), labels(bfs, 'BFS 分群')], 7);
    return r.frames;
  },
};

// ---------------- Hough 直線 ----------------
const hough: AlgoDef = {
  id: 'hough-lines', name: 'Hough 直線轉換', en: 'Hough Line Transform', cat,
  desc: '每條直線都能寫成 ρ = x·cos θ + y·sin θ（ρ 是原點到直線的有號距離，θ 是法線角度），這個寫法連垂直線（θ = 0）也能表示，不像 y = mx + b 會遇到斜率無限大。每個邊緣點對所有 θ 投票給對應的 ρ，在 (θ, ρ) 累加器中畫出一條正弦曲線；共線的點的曲線交於一點，得票最多的格子就是直線。θ 只取 [0°, 180°)，ρ 可正可負，避免重複表示。',
  time: 'O(E·Θ)，E 為邊緣點數', space: 'O(Θ·R)',
  code: ['累加器 acc[θ][ρ] = 0，θ 取 0°, 3°, …, 177°', 'for 每個邊緣點 (x, y):', '  for 每個 θ:', '    ρ = round(x·cos θ + y·sin θ)', '    acc[θ][ρ] += 1', '峰值：票數 ≥ 門檻且為 5×5 鄰域最大', '每個峰值 (θ, ρ) 對應一條直線'],
  inputs: [inSelect('img', '邊緣影像', [['lines', '三條直線'], ['shapes', '幾何圖形的 Sobel 邊緣']]), inNum('thr', '票數門檻', 8, 2, 40, () => rnd.pick([6, 8, 10]))],
  run({ img: name, thr }) {
    const r = new Rec();
    let E: Img;
    if (name === 'lines') E = toBinary(presetImage('lines'));
    else { const { gx, gy } = sobel(presetImage('shapes')); const m = mapImg(gx, (v, i, j) => Math.hypot(v, gy[i][j])); const mx = imgMax(m); E = mapImg(m, (v) => (v > 0.5 * mx ? 1 : 0)); }
    const pts: Pt[] = [];
    E.forEach((row, y) => row.forEach((v, x) => { if (v) pts.push([x, y]); }));
    const D = Math.ceil(Math.hypot(16, 16));
    const TH = 60;
    const acc = Array.from({ length: 2 * D + 1 }, () => new Array(TH).fill(0));
    const cs = Array.from({ length: TH }, (_, t) => Math.cos((t * 3 * Math.PI) / 180)), sn = Array.from({ length: TH }, (_, t) => Math.sin((t * 3 * Math.PI) / 180));
    const accPanel = (hl: CM = {}, marks: { r: number; c: number; color?: Color }[] = []) => img(acc, { title: `累加器（列：ρ = −${D}…${D}，行：θ = 0°…177°）`, palette: 'heat', range: [0, Math.max(1, imgMax(acc))], cell: 7, colors: hl, marks });
    r.snap(`${pts.length} 個邊緣點（x = 行、y = 列）；θ 每 3° 一格共 ${TH} 格，ρ 從 −${D} 到 ${D}`, [labels(E, '邊緣點'), accPanel()], 1);
    pts.forEach(([x, y], k) => {
      const hl: CM = {};
      for (let t = 0; t < TH; t++) { const rho = Math.round(x * cs[t] + y * sn[t]); acc[rho + D][t]++; hl[`${rho + D},${t}`] = 'swap'; }
      if (k < 3 || k === pts.length - 1) r.snap(`點 (x=${x}, y=${y}) 對每個 θ 投票：在累加器中畫出一條正弦曲線${k === pts.length - 1 ? `（全部 ${pts.length} 點投票完成）` : ''}`, [labels(E, '邊緣點', { colors: { [`${y},${x}`]: 'swap' } }), accPanel(k === pts.length - 1 ? {} : hl)], 5);
    });
    const peaks: [number, number][] = [];
    for (let i = 0; i < acc.length; i++) for (let t = 0; t < TH; t++) {
      if (acc[i][t] < thr) continue;
      let ok = true;
      for (let a = -2; a <= 2 && ok; a++) for (let b = -2; b <= 2 && ok; b++) {
        if (!a && !b) continue;
        const y = i + a, tt = (t + b + TH) % TH, yy = t + b < 0 || t + b >= TH ? 2 * D - y : y;
        if (yy < 0 || yy >= acc.length) continue;
        if (acc[yy][tt] > acc[i][t] || (acc[yy][tt] === acc[i][t] && (a < 0 || (a === 0 && b < 0)))) ok = false;
      }
      if (ok) peaks.push([i - D, t * 3]);
    }
    const onLine: CM = {};
    peaks.forEach(([rho, deg], k) => { const c = Math.cos((deg * Math.PI) / 180), s = Math.sin((deg * Math.PI) / 180); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (Math.abs(x * c + y * s - rho) < 0.5) onLine[`${y},${x}`] = (['bad', 'done', 'special', 'compare', 'frontier'] as Color[])[k % 5]; });
    r.snap(`票數 ≥ ${thr} 的局部峰值 ${peaks.length} 個：${peaks.map(([rho, deg]) => `θ = ${deg}°、ρ = ${rho}（${acc[rho + D][deg / 3]} 票）${deg === 0 ? '←垂直線' : deg === 90 ? '←水平線' : ''}`).join('；')}`, [labels(E, '偵測到的直線', { colors: onLine }), accPanel({}, peaks.map(([rho, deg]) => ({ r: rho + D, c: deg / 3, color: 'done' as Color })))], 7);
    return r.frames;
  },
};

// ---------------- RANSAC ----------------
const ransacData = (seed: number) => {
  const g = parkMiller(seed);
  const pts: Pt[] = [];
  for (let i = 0; i < 20; i++) { const x = 0.5 + (i * 9) / 19; pts.push([x, 0.6 * x + 2 + (g.real() - 0.5) * 0.6]); }
  for (let i = 0; i < 10; i++) pts.push([g.real() * 10, g.real() * 10]);
  return pts;
};
const lsq = (P: Pt[]) => { const n = P.length, sx = P.reduce((s, p) => s + p[0], 0), sy = P.reduce((s, p) => s + p[1], 0), sxx = P.reduce((s, p) => s + p[0] * p[0], 0), sxy = P.reduce((s, p) => s + p[0] * p[1], 0); const det = n * sxx - sx * sx; return det ? [(n * sxy - sx * sy) / det, (sxx * sy - sx * sxy) / det] : [0, sy / n]; };
const ransac: AlgoDef = {
  id: 'ransac', name: '隨機抽樣一致性', en: 'RANSAC (Line Fitting)', cat,
  desc: '資料中混有大量離群值時，最小平方法會被拉偏。RANSAC 反覆：隨機抽出最少需要的點（直線為 2 點）建立候選模型，計算有多少點落在誤差門檻內（內點），保留內點最多的模型；最後只用它的內點重新做最小平方擬合。抽到重合的兩點無法決定直線（退化樣本），直接重抽。使用固定種子的 Park–Miller 亂數，結果可重現。',
  time: 'O(k·n)，k 為迭代次數', space: 'O(n)',
  code: ['best = 無，bestCount = 0', 'repeat k 次:', '  隨機抽兩個點 p, q（相同位置 → 退化，重抽）', '  直線 = 通過 p、q', '  內點 = 到直線距離 < 門檻的點', '  if |內點| > bestCount: best = 直線', '用 best 的內點做最小平方 y = ax + b（解 2×2 正規方程）', '對照：全部點的最小平方會被離群值拉偏'],
  inputs: [inNum('seed', '亂數種子', 42, 1, 1e9, () => rnd.int(1, 99999)), inNum('iters', '迭代次數', 20, 1, 200, () => rnd.pick([5, 10, 20, 50])), inSelect('thr', '誤差門檻', [['0.5', '0.5'], ['0.3', '0.3'], ['1', '1.0']])],
  run({ seed, iters, thr }) {
    const r = new Rec();
    const P = ransacData(7);
    const g = parkMiller(seed);
    const th = Number(thr);
    const lineSeg = (a: number, b: number, color: Color, dashed = false) => ({ x1: -0.5, y1: a * -0.5 + b, x2: 10.5, y2: a * 10.5 + b, color, dashed, width: 2 });
    const plot = (segs: PlotPanel['segments'], inl: Set<number> = new Set(), samp: number[] = []): PlotPanel => ({ type: 'plot', square: true, axes: true, bounds: [-0.5, 10.5, -0.5, 10.5], segments: segs, points: P.map(([x, y], i) => ({ x, y, r: samp.includes(i) ? 6 : 4, color: (samp.includes(i) ? 'swap' : inl.has(i) ? 'done' : i >= 20 ? 'bad' : 'muted') as Color })) });
    const [la, lb] = lsq(P);
    r.snap(`30 個點：20 個在 y = 0.6x + 2 附近，10 個離群值（紅）。全部點做最小平方得 y = ${f2(la)}x + ${f2(lb)}，被離群值拉偏`, [plot([lineSeg(la, lb, 'bad', true)])], 8);
    let best: { a: number; b: number; c: number; inl: Set<number> } | null = null;
    for (let it = 1; it <= iters; it++) {
      const i = g.int(P.length);
      let j = g.int(P.length);
      let tries = 0;
      while ((P[j][0] === P[i][0] && P[j][1] === P[i][1]) && tries++ < 10) j = g.int(P.length);
      if (P[j][0] === P[i][0] && P[j][1] === P[i][1]) { r.snap(`第 ${it} 次：抽到同一點 ${i}，退化樣本無法決定直線，略過`, [plot([])], 3); continue; }
      const [x1, y1] = P[i], [x2, y2] = P[j];
      const A = y2 - y1, B = x1 - x2, C = -(A * x1 + B * y1), nrm = Math.hypot(A, B);
      const inl = new Set(P.map((p, k) => (Math.abs(A * p[0] + B * p[1] + C) / nrm < th ? k : -1)).filter((k) => k >= 0));
      const segs: PlotPanel['segments'] = Math.abs(B) > 1e-12 ? [lineSeg(-A / B, -C / B, 'swap')] : [{ x1: x1, y1: -0.5, x2: x1, y2: 10.5, color: 'swap', width: 2 }];
      const better = !best || inl.size > best.inl.size;
      if (better) best = { a: Math.abs(B) > 1e-12 ? -A / B : Infinity, b: Math.abs(B) > 1e-12 ? -C / B : x1, c: inl.size, inl };
      if (it <= 8 || better || it === iters) r.snap(`第 ${it} 次：抽到點 ${i}、${j}，內點 ${inl.size} 個${better ? '（目前最多）' : `（最佳仍是 ${best!.c} 個）`}`, [plot(segs, inl, [i, j])], better ? 6 : 5);
    }
    if (!best) { r.snap('沒有得到任何有效模型', [plot([])], 7); return r.frames; }
    const inPts = [...best.inl].map((k) => P[k]);
    const [ra, rb] = lsq(inPts);
    const realIn = [...best.inl].filter((k) => k < 20).length;
    r.snap(`用最佳模型的 ${inPts.length} 個內點（其中 ${realIn} 個是真正的內點）重新最小平方：y = ${f2(ra)}x + ${f2(rb)}；真實為 y = 0.6x + 2，全部點的最小平方為 y = ${f2(la)}x + ${f2(lb)}`, [plot([lineSeg(la, lb, 'bad', true), lineSeg(ra, rb, 'done')], best.inl)], 7);
    return r.frames;
  },
};

// ---------------- Lucas–Kanade ----------------
const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
/** 光流測試影像：上方平坦、左側只有垂直條紋（孔徑問題）、右下是二維紋理；各區之間平滑過渡 */
const lkAt = (y: number, x: number) => 128 + smooth(y - 4) * (50 * Math.sin(0.5 * x) + smooth((x - 7) / 2) * (40 * Math.sin(0.45 * y + 0.3 * x) + 30 * Math.cos(0.35 * x - 0.4 * y)));
const lkFrame = (dx: number, dy: number): Img => mapImg(blank(16, 16), (_, r, c) => lkAt(r - dy, c - dx));
const lucasKanade: AlgoDef = {
  id: 'lucas-kanade', name: 'Lucas–Kanade 光流', en: 'Lucas–Kanade Optical Flow', cat,
  desc: '估計兩張連續影像間每個點的位移 (u, v)。假設亮度恆常（同一個點在下一張的亮度不變）且位移很小，泰勒展開得 Ix·u + Iy·v + It = 0——一個方程兩個未知數。Lucas–Kanade 再假設小視窗內所有點位移相同，以最小平方求解 [ΣIx² ΣIxIy; ΣIxIy ΣIy²]·[u v]ᵀ = −[ΣIxIt ΣIyIt]ᵀ。矩陣的兩個特徵值都夠大才可靠：只有一個方向有紋理（邊緣、條紋）時只能估出垂直於邊緣的分量，這就是「孔徑問題」；平坦區則完全無法估計。位移太大會破壞小位移假設。',
  time: 'O(HW·w²)', space: 'O(HW)',
  code: ['Ix, Iy = 第一張的中央差分梯度；It = I₂ − I₁', 'for 每個追蹤點 p:', '  在 5×5 視窗內累加 A = [ΣIx² ΣIxIy; ΣIxIy ΣIy²]，b = −[ΣIxIt; ΣIyIt]', '  λ₁ ≥ λ₂ = A 的特徵值', '  λ₂ 太小：λ₁ 也小 → 平坦，無法估計；只有 λ₁ 大 → 孔徑問題', '  否則 [u v] = A⁻¹ b（2×2 線性方程）', '前提：亮度恆常、位移小（約 1 像素以內）'],
  inputs: [inSelect('shift', '真實位移 (u, v)', [['1,0.5', '(1, 0.5)'], ['0.5,0', '(0.5, 0)'], ['0,1', '(0, 1)'], ['3,2', '(3, 2)（太大）']])],
  run({ shift }) {
    const r = new Rec();
    const [du, dv] = String(shift).split(',').map(Number);
    const I1 = lkFrame(0, 0), I2 = lkFrame(du, dv);
    const Ix = mapImg(I1, (_, i, j) => (j > 0 && j < 15 ? (I1[i][j + 1] - I1[i][j - 1]) / 2 : 0));
    const Iy = mapImg(I1, (_, i, j) => (i > 0 && i < 15 ? (I1[i + 1][j] - I1[i - 1][j]) / 2 : 0));
    const It = mapImg(I2, (v, i, j) => v - I1[i][j]);
    r.snap(`第二張 = 第一張平移 (${du}, ${dv})。上方是平坦區、左側只有垂直條紋、右下是二維紋理（各區平滑過渡）`, [gray(I1, 'I₁', { range: [0, 255] }), gray(I2, 'I₂', { range: [0, 255] })], 7);
    r.snap('梯度 Ix、Iy 與時間差 It', [img(Ix, { title: 'Ix', palette: 'signed', range: [imgMin(Ix), imgMax(Ix)], w: half }), img(Iy, { title: 'Iy', palette: 'signed', range: [imgMin(Iy), imgMax(Iy)], w: half }), img(It, { title: 'It = I₂ − I₁', palette: 'signed', range: [imgMin(It), imgMax(It)], w: half })], 1);
    const res: { p: Pt; u: number; v: number; kind: string; l1: number; l2: number }[] = [];
    for (const i of [1, 8, 12]) for (const j of [2, 4, 11, 13]) {
      let a = 0, b = 0, c = 0, bx = 0, by = 0;
      for (let y = Math.max(1, i - 2); y <= Math.min(14, i + 2); y++) for (let x = Math.max(1, j - 2); x <= Math.min(14, j + 2); x++) { a += Ix[y][x] ** 2; b += Ix[y][x] * Iy[y][x]; c += Iy[y][x] ** 2; bx -= Ix[y][x] * It[y][x]; by -= Iy[y][x] * It[y][x]; }
      const tr = a + c, det = a * c - b * b, disc = Math.sqrt(Math.max(0, (tr / 2) ** 2 - det));
      const l1 = tr / 2 + disc, l2 = tr / 2 - disc;
      let kind = '可靠', u = 0, v = 0;
      if (l1 < 200) kind = '平坦';
      else if (l2 < 0.05 * l1) kind = '孔徑問題';
      else { u = (c * bx - b * by) / det; v = (a * by - b * bx) / det; }
      res.push({ p: [i, j], u, v, kind, l1, l2 });
    }
    const pick = res.filter((x, k, arr) => arr.findIndex((y) => y.kind === x.kind) === k);
    for (const x of pick) {
      const [i, j] = x.p;
      const cl: CM = {};
      for (let y = i - 2; y <= i + 2; y++) for (let z = j - 2; z <= j + 2; z++) cl[`${y},${z}`] = x.kind === '可靠' ? 'done' : x.kind === '平坦' ? 'muted' : 'bad';
      r.snap(`點 (${i}, ${j})：特徵值 λ₁ = ${f2(x.l1)}、λ₂ = ${f2(x.l2)} → ${x.kind}${x.kind === '可靠' ? `，解出 (u, v) = (${f2(x.u)}, ${f2(x.v)})` : x.kind === '孔徑問題' ? '：只有一個方向有梯度，沿邊緣方向的位移看不出來' : '：視窗內幾乎沒有梯度'}`, [gray(I1, 'I₁ 與視窗', { range: [0, 255], colors: cl }), vars({ λ1: f2(x.l1), λ2: f2(x.l2), 判斷: x.kind })], x.kind === '可靠' ? 6 : 5);
    }
    const ok = res.filter((x) => x.kind === '可靠');
    const err = ok.length ? ok.reduce((s, x) => s + Math.hypot(x.u - du, x.v - dv), 0) / ok.length : NaN;
    const arrows: PlotPanel['segments'] = ok.map((x) => ({ x1: x.p[1], y1: 15 - x.p[0], x2: x.p[1] + x.u, y2: 15 - x.p[0] - x.v, color: 'done' as Color, width: 2.5 }));
    const flow: PlotPanel = { type: 'plot', square: true, bounds: [-0.5, 15.5, -0.5, 15.5], segments: arrows, points: res.map((x) => ({ x: x.p[1], y: 15 - x.p[0], r: 3.5, color: (x.kind === '可靠' ? 'done' : x.kind === '平坦' ? 'muted' : 'bad') as Color })), title: '光流（綠箭頭：可靠；紅：孔徑問題；灰：平坦）', w: half };
    r.snap(`${res.length} 個追蹤點：可靠 ${ok.length}、孔徑問題 ${res.filter((x) => x.kind === '孔徑問題').length}、平坦 ${res.filter((x) => x.kind === '平坦').length}。可靠點的平均誤差 ${Number.isNaN(err) ? '—' : f2(err)} 像素${Math.hypot(du, dv) > 2 ? '：位移太大，小位移的泰勒近似失效，誤差很大' : '（這是單步估計；實務上會迭代修正，或用影像金字塔處理較大的位移）'}`, [gray(I1, 'I₁', { range: [0, 255] }), flow, table(res.map((x) => [`(${x.p[0]},${x.p[1]})`, x.kind, x.kind === '可靠' ? `${f2(x.u)}, ${f2(x.v)}` : '—']), {}, { title: '各點結果', colHeaders: ['點', '判斷', '(u, v)'] })], 7);
    return r.frames;
  },
};

// ---------------- 距離轉換 ----------------
const distanceT: AlgoDef = {
  id: 'distance-transform', name: '距離轉換', en: 'Distance Transform (Multi-source BFS)', cat,
  desc: '對二值影像中每個前景像素，求它到最近背景像素的距離。把所有背景像素同時放進佇列做多源 BFS：第 k 層就是距離為 k 的像素。4 鄰接 BFS 得到的是 L1（曼哈頓）距離 |Δr| + |Δc|，8 鄰接得到 L∞（棋盤）距離 max(|Δr|, |Δc|)——兩者都不是精確的歐氏距離，斜方向尤其不同。結果與逐一暴力計算比對。',
  time: 'O(HW)', space: 'O(HW)',
  code: ['dist[p] = 0（背景）或 ∞（前景）', 'queue = 所有背景像素', 'while queue 不空:', '  p = queue.pop_front()', '  for p 的每個鄰居 q（4 鄰接 → L1；8 鄰接 → L∞）:', '    if dist[q] == ∞: dist[q] = dist[p] + 1；queue.push(q)', '注意：不是歐氏距離'],
  inputs: [inSelect('img', '測試影像', [['blobs', '相鄰圓斑（二值）'], ['shapes', '幾何圖形（亮於 100 為前景）']]), inSelect('metric', '距離', [['L1', 'L1 曼哈頓（4 鄰接）'], ['Linf', 'L∞ 棋盤（8 鄰接）']])],
  run({ img: name, metric }) {
    const r = new Rec();
    const B = name === 'blobs' ? toBinary(presetImage('blobs')) : mapImg(presetImage('shapes'), (v) => (v > 100 ? 1 : 0));
    const nb = metric === 'L1' ? N4 : N8;
    const dist = mapImg(B, (v) => (v ? Infinity : 0));
    let layer: Pt[] = [];
    B.forEach((row, i) => row.forEach((v, j) => { if (!v) layer.push([i, j]); }));
    const show = () => img(mapImg(dist, (v) => (Number.isFinite(v) ? v : NaN)), { title: `${metric === 'L1' ? 'L1' : 'L∞'} 距離（數字）`, palette: 'heat', range: [0, 6], vals: true, cell: 24 });
    r.snap(`${layer.length} 個背景像素同時作為起點（距離 0）`, [labels(B, '二值影像'), show()], 2);
    let d = 0;
    while (layer.length) {
      const next: Pt[] = [];
      for (const [i, j] of layer) for (const [a, b] of nb) { const y = i + a, x = j + b; if (inside(B, y, x) && dist[y][x] === Infinity) { dist[y][x] = d + 1; next.push([y, x]); } }
      if (!next.length) break;
      d++;
      r.snap(`第 ${d} 層：${next.length} 個像素的距離為 ${d}`, [show()], 6);
      layer = next;
    }
    const bg: Pt[] = [];
    B.forEach((row, i) => row.forEach((v, j) => { if (!v) bg.push([i, j]); }));
    let mism = 0, maxDiff = 0, at: Pt = [0, 0];
    B.forEach((row, i) => row.forEach((v, j) => {
      if (!v) return;
      const brute = Math.min(...bg.map(([y, x]) => (metric === 'L1' ? Math.abs(y - i) + Math.abs(x - j) : Math.max(Math.abs(y - i), Math.abs(x - j)))));
      if (brute !== dist[i][j]) mism++;
      const eu = Math.min(...bg.map(([y, x]) => Math.hypot(y - i, x - j)));
      if (Math.abs(eu - dist[i][j]) > maxDiff) { maxDiff = Math.abs(eu - dist[i][j]); at = [i, j]; }
    }));
    r.snap(`完成：最大距離 ${d}；與暴力計算比對 ${mism ? `${mism} 個不符` : '全部相符'}。與歐氏距離最大相差 ${f2(maxDiff)}（在 (${at[0]}, ${at[1]})），所以這是 ${metric === 'L1' ? 'L1' : 'L∞'} 距離，不是歐氏距離`, [labels(B, '二值影像'), show()], 7);
    return r.frames;
  },
};

// ---------------- 分水嶺 ----------------
const watershed: AlgoDef = {
  id: 'watershed', name: '分水嶺分割', en: 'Watershed (Priority Flood)', cat,
  desc: '把灰階影像想成地形，暗處是盆地。從每個「區域極小值」（周圍沒有更低處的平臺）放水，水位慢慢上升，不同盆地的水相遇處就是分水嶺（邊界）。實作用優先佇列：所有極小值先標上不同編號並入列，每次取出最低的像素，把尚未標記的鄰居標成同一編號並入列。同高度的平臺依入列先後（先進先出）處理，結果才固定。常見應用：對「負的距離轉換」做分水嶺，分開黏在一起的物體；直接用在雜訊多的影像上則會過度分割。',
  time: 'O(HW log HW)', space: 'O(HW)',
  code: ['找出所有區域極小值（同值平臺且沒有更低的鄰居），各給一個編號', '把它們放進優先佇列（鍵 = 高度，同高度依入列順序）', 'while 佇列不空:', '  p = 取出最低者', '  for p 的每個 4 鄰居 q（尚未標記）:', '    label[q] = label[p]；q 入列', '相鄰像素標籤不同之處即為分水嶺線'],
  inputs: [inSelect('src', '地形', [['dist', '相鄰圓斑的負歐氏距離轉換'], ['grad', '幾何圖形的梯度強度'], ['noisy', '雜訊影像的梯度強度（過度分割）']])],
  run({ src }) {
    const r = new Rec();
    let H: Img;
    if (src === 'dist') {
      const B = toBinary(presetImage('blobs'));
      const bg: Pt[] = [];
      B.forEach((row, i) => row.forEach((v, j) => { if (!v) bg.push([i, j]); }));
      H = mapImg(B, (v, i, j) => (v ? -Math.round(Math.min(...bg.map(([y, x]) => Math.hypot(y - i, x - j))) * 10) / 10 : 1));
    } else {
      const base = src === 'grad' ? presetImage('shapes') : presetImage('noisy');
      const { gx, gy } = sobel(gaussBlur(base, 0.7));
      H = mapImg(gx, (v, i, j) => Math.round(Math.hypot(v, gy[i][j]) / 20));
    }
    const lab = blank(16, 16);
    const seen = blank(16, 16);
    let nl = 0;
    for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) {
      if (seen[i][j]) continue;
      const comp: Pt[] = [[i, j]];
      seen[i][j] = 1;
      let isMin = true;
      for (let k = 0; k < comp.length; k++) {
        const [y, x] = comp[k];
        for (const [a, b] of N4) { const yy = y + a, xx = x + b; if (!inside(H, yy, xx)) continue; if (H[yy][xx] < H[i][j]) isMin = false; else if (H[yy][xx] === H[i][j] && !seen[yy][xx]) { seen[yy][xx] = 1; comp.push([yy, xx]); } }
      }
      if (isMin) { nl++; for (const [y, x] of comp) lab[y][x] = nl; }
    }
    const terr = () => img(H, { title: '地形（越暗越低）', palette: 'gray', range: [imgMin(H), imgMax(H)], w: half });
    r.snap(`找到 ${nl} 個區域極小值（含平臺），各給一個編號`, [terr(), labels(lab, '初始標記')], 1);
    type Item = { h: number; seq: number; p: Pt };
    const heap: Item[] = [];
    let seq = 0;
    const push = (it: Item) => { heap.push(it); let i = heap.length - 1; while (i > 0) { const pa = (i - 1) >> 1; if (heap[pa].h < it.h || (heap[pa].h === it.h && heap[pa].seq < it.seq)) break; heap[i] = heap[pa]; i = pa; } heap[i] = it; };
    const pop = () => { const top = heap[0], last = heap.pop()!; if (heap.length) { let i = 0; for (;;) { const l = 2 * i + 1, rr = l + 1; let m = i; const less = (a: Item, b: Item) => a.h < b.h || (a.h === b.h && a.seq < b.seq); const cand = [l, rr].filter((k) => k < heap.length); let best: Item = last; for (const k of cand) if (less(heap[k], best)) { best = heap[k]; m = k; } if (m === i) break; heap[i] = heap[m]; i = m; } heap[i] = last; } return top; };
    for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) if (lab[i][j]) push({ h: H[i][j], seq: seq++, p: [i, j] });
    r.snap(`${heap.length} 個極小值像素放入優先佇列（同高度依入列順序）`, [terr(), labels(lab, '標記')], 2);
    let popped = 0;
    const total = 256;
    let labeled = lab.flat().filter((v) => v).length;
    const every = Math.max(1, Math.floor(total / 10));
    while (heap.length) {
      const { p: [i, j], h } = pop();
      popped++;
      for (const [a, b] of N4) { const y = i + a, x = j + b; if (inside(H, y, x) && !lab[y][x]) { lab[y][x] = lab[i][j]; labeled++; push({ h: H[y][x], seq: seq++, p: [y, x] }); } }
      if (popped % every === 0) r.snap(`水位到 ${f2(h)}：已處理 ${popped} 個像素，標記 ${labeled} / ${total}`, [terr(), labels(lab, '淹水中的盆地')], 6);
    }
    const line: CM = {};
    for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) for (const [a, b] of [[0, 1], [1, 0]]) if (inside(H, i + a, j + b) && lab[i + a][j + b] !== lab[i][j]) line[`${i},${j}`] = 'bad';
    r.snap(`完成：分成 ${nl} 個區域${src === 'noisy' ? '——雜訊造成大量假的極小值，嚴重過度分割（實務上會先平滑或使用標記控制）' : src === 'dist' ? '：兩個黏在一起的圓斑被分開了' : ''}；紅框為分水嶺線（相鄰標籤不同）`, [terr(), labels(lab, '分割結果', { colors: line })], 7);
    return r.frames;
  },
};

// ---------------- 接縫裁切 ----------------
const seamCarving: AlgoDef = {
  id: 'seam-carving', name: '接縫裁切', en: 'Seam Carving', cat,
  desc: '內容感知的縮放：與其平均地壓縮每一行，不如每次刪除一條「最不重要」的垂直接縫——從頂端到底端每列各一個像素、相鄰兩列的位置最多差 1、能量（梯度大小）總和最小。用動態規劃：M[r][c] = e[r][c] + min(M[r−1][c−1], M[r−1][c], M[r−1][c+1])，最後一列取最小值再往回追溯。每次只縮一行，縮完重新計算能量再找下一條。平坦的背景先被刪掉，物體的形狀得以保留。',
  time: '每條接縫 O(HW)', space: 'O(HW)',
  code: ['e = |Gx| + |Gy|（Sobel 能量）', 'M[0][c] = e[0][c]', 'for r = 1 .. H−1:', '  M[r][c] = e[r][c] + min(M[r−1][c−1 .. c+1])', '最後一列取 M 最小的 c，往上追溯：每列從 c−1 .. c+1 選 M 最小者', '刪除接縫上的像素（每列一個），寬度減 1', '重複 k 次（每次重新計算能量）'],
  inputs: [inSelect('img', '測試影像', [['shapes', '幾何圖形'], ['texture', '平滑紋理'], ['step', '階梯邊緣']]), inSelect('k', '刪除接縫數', [['3', '3 條'], ['1', '1 條'], ['6', '6 條']])],
  run({ img: name, k }) {
    const r = new Rec();
    let A = presetImage(name);
    const orig = A;
    const K = Number(k);
    const removedMask = blank(16, 16);
    let colIdx = A.map((row) => row.map((_, j) => j));
    for (let s = 1; s <= K; s++) {
      const W = A[0].length;
      const { gx, gy } = sobel(A);
      const e = mapImg(gx, (v, i, j) => Math.abs(v) + Math.abs(gy[i][j]));
      const M = e.map((row) => [...row]);
      for (let i = 1; i < 16; i++) for (let j = 0; j < W; j++) M[i][j] += Math.min(M[i - 1][j], j > 0 ? M[i - 1][j - 1] : Infinity, j < W - 1 ? M[i - 1][j + 1] : Infinity);
      const seam: number[] = new Array(16);
      let c = 0;
      for (let j = 1; j < W; j++) if (M[15][j] < M[15][c]) c = j;
      seam[15] = c;
      for (let i = 14; i >= 0; i--) { let best = seam[i + 1]; for (const j of [seam[i + 1] - 1, seam[i + 1] + 1]) if (j >= 0 && j < W && M[i][j] < M[i][best]) best = j; seam[i] = best; }
      const connected = seam.every((v, i) => i === 0 || Math.abs(v - seam[i - 1]) <= 1);
      const marks = seam.map((cc, i) => ({ r: i, c: cc, color: 'bad' as Color }));
      if (s === 1) r.snap('能量 = |Gx| + |Gy|：邊緣能量高，平坦背景能量低', [gray(A, '目前影像'), img(e, { title: '能量', palette: 'heat', range: [0, imgMax(e) || 1], w: half })], 1);
      r.snap(`第 ${s} 條接縫：累積能量表 M 最後一列最小值 ${f2(M[15][seam[15]])}，往上追溯；每列位置相差 ≤ 1：${connected ? '是' : '否！'}`, [gray(A, '目前影像', { marks }), img(M, { title: '累積能量 M', palette: 'heat', range: [0, imgMax(M) || 1], w: half, marks })], 5);
      seam.forEach((cc, i) => { removedMask[i][colIdx[i][cc]] = s; });
      A = A.map((row, i) => row.filter((_, j) => j !== seam[i]));
      colIdx = colIdx.map((row, i) => row.filter((_, j) => j !== seam[i]));
      r.snap(`刪除接縫，寬度 ${W} → ${W - 1}`, [gray(A, `寬 ${W - 1}`), labels(removedMask, '已刪除的接縫（在原圖上的位置）')], 6);
    }
    const scaled = orig.map((row) => Array.from({ length: 16 - K }, (_, j) => row[Math.min(15, Math.round((j * 15) / Math.max(1, 15 - K)))]));
    r.snap(`完成：刪除 ${K} 條接縫，寬度 16 → ${16 - K}；與直接等比例縮放比較，物體形狀保留得更完整`, [gray(orig, '原圖'), gray(A, '接縫裁切'), gray(scaled, '直接縮放（對照）')], 7);
    return r.frames;
  },
};

export default [clahe, morphology, floodFill, components, hough, ransac, lucasKanade, distanceT, watershed, seamCarving];
