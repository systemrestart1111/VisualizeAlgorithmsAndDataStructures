// 機器學習與隨機最佳化
import type { AlgoDef, Color, GEdge, GNode, GraphPanel, Panel, PlotPanel } from '../core/types';
import { Rec, bars, inNum, inSelect, inText, rnd, table, text, vars } from '../core/helpers';
import { parkMiller } from '../core/extra';

const cat = 'ml';
type Pt = [number, number];
type CM = Record<string, Color | undefined>;
const CL: Color[] = ['active', 'bad', 'good', 'special', 'compare', 'frontier', 'visited', 'path'];
const f3 = (v: number) => { const x = +v.toFixed(3); return Math.abs(x) < 1e-12 ? 0 : x; };
const f4 = (v: number) => { const x = +v.toFixed(4); return Math.abs(x) < 1e-12 ? 0 : x; };
const seedIn = (def = 42) => inNum('seed', '亂數種子', def, 1, 1e9, () => rnd.int(1, 99999));
const lossPlot = (series: { pts: Pt[]; color: Color }[], title: string, w?: 'half'): PlotPanel => {
  const all = series.flatMap((s) => s.pts);
  const ys = all.map((p) => p[1]).filter(Number.isFinite);
  const xs = all.map((p) => p[0]);
  return { type: 'plot', axes: true, bounds: [0, Math.max(1, ...xs), Math.min(0, ...ys), Math.max(1e-9, ...ys) * 1.05], curves: series.map((s) => ({ pts: s.pts, color: s.color, width: 2 })), title, w };
};

// ---------------- 線性迴歸 ----------------
const lineData = (kind: string, seed: number): Pt[] => {
  const g = parkMiller(seed);
  return Array.from({ length: 12 }, (_, i) => { const x = 0.5 + i * 0.8; return [x, kind === 'exact' ? 2 * x + 1 : 2 * x + 1 + (g.real() - 0.5) * 4]; });
};
const linearRegression: AlgoDef = {
  id: 'linear-regression', name: '線性迴歸', en: 'Linear Regression', cat,
  desc: '用直線 ŷ = w·x + b 擬合資料，使均方誤差 MSE = (1/n)Σ(ŷ − y)² 最小。有兩種解法：①解析解——對 w、b 偏微分設為 0，得到正規方程，直接算出最佳值；②梯度下降——沿著 ∂MSE/∂w = (2/n)Σ(ŷ − y)x、∂MSE/∂b = (2/n)Σ(ŷ − y) 的反方向一步步走。兩者應收斂到同一條線。選擇「資料剛好在 y = 2x + 1 上」時，兩種方法都應精確還原 w = 2、b = 1。',
  time: '解析解 O(n)；梯度下降每輪 O(n)', space: 'O(1)',
  code: ['解析解：w = (nΣxy − ΣxΣy) / (nΣx² − (Σx)²)，b = (Σy − wΣx) / n', '梯度下降：w = b = 0', 'repeat epochs 次:', '  e_i = (w·x_i + b) − y_i', '  w −= η·(2/n)·Σ e_i·x_i', '  b −= η·(2/n)·Σ e_i', '比較兩者的 w、b 與 MSE'],
  inputs: [inSelect('data', '資料', [['noisy', 'y = 2x + 1 加上雜訊'], ['exact', '剛好在 y = 2x + 1 上']]), inSelect('lr', '學習率 η', [['0.02', '0.02'], ['0.005', '0.005（慢）'], ['0.05', '0.05（太大，發散）']]), inNum('epochs', '輪數', 200, 1, 2000, () => rnd.pick([50, 200, 500])), seedIn()],
  run({ data, lr, epochs, seed }) {
    const r = new Rec();
    const P = lineData(data, seed);
    const n = P.length, eta = Number(lr);
    const sx = P.reduce((s, p) => s + p[0], 0), sy = P.reduce((s, p) => s + p[1], 0), sxx = P.reduce((s, p) => s + p[0] * p[0], 0), sxy = P.reduce((s, p) => s + p[0] * p[1], 0);
    const wa = (n * sxy - sx * sy) / (n * sxx - sx * sx), ba = (sy - wa * sx) / n;
    const mse = (w: number, b: number) => P.reduce((s, [x, y]) => s + (w * x + b - y) ** 2, 0) / n;
    const lineSeg = (w: number, b: number, color: Color, dashed = false) => ({ x1: 0, y1: b, x2: 10.5, y2: w * 10.5 + b, color, dashed, width: 2 });
    const plot = (w: number, b: number, extra: PlotPanel['segments'] = []): PlotPanel => ({ type: 'plot', axes: true, bounds: [0, 10.5, -2, 26], points: P.map(([x, y]) => ({ x, y, r: 4, color: 'active' as Color })), segments: [...extra!, lineSeg(w, b, 'swap'), ...P.map(([x, y]) => ({ x1: x, y1: y, x2: x, y2: w * x + b, color: 'muted' as Color, dashed: true, width: 1 }))], w: 'half' });
    r.snap(`解析解（正規方程）：w = ${f4(wa)}、b = ${f4(ba)}，MSE = ${f4(mse(wa, ba))}${data === 'exact' ? '——資料無雜訊，精確還原 w = 2、b = 1' : ''}`, [plot(wa, ba), vars({ w: f4(wa), b: f4(ba), MSE: f4(mse(wa, ba)) })], 1);
    let w = 0, b = 0;
    const curve: Pt[] = [[0, mse(0, 0)]];
    const every = Math.max(1, Math.floor(epochs / 12));
    for (let ep = 1; ep <= epochs; ep++) {
      let gw = 0, gb = 0;
      for (const [x, y] of P) { const e = w * x + b - y; gw += (2 / n) * e * x; gb += (2 / n) * e; }
      w -= eta * gw; b -= eta * gb;
      const L = mse(w, b);
      curve.push([ep, Math.min(L, 1e4)]);
      if (!Number.isFinite(L) || L > 1e6) { r.snap(`第 ${ep} 輪：MSE 爆增到 ${L.toExponential(2)}，學習率太大，梯度下降發散`, [plot(wa, ba), lossPlot([{ pts: curve, color: 'bad' }], 'MSE', 'half')], 5); return r.frames; }
      if (ep <= 3 || ep % every === 0 || ep === epochs) r.snap(`第 ${ep} 輪：梯度 (${f4(gw)}, ${f4(gb)})，w = ${f4(w)}、b = ${f4(b)}，MSE = ${f4(L)}`, [plot(w, b, [lineSeg(wa, ba, 'done', true)]), lossPlot([{ pts: [...curve], color: 'active' }], 'MSE 隨輪數下降', 'half')], 5);
    }
    r.snap(`梯度下降 ${epochs} 輪後 w = ${f4(w)}、b = ${f4(b)}（解析解 ${f4(wa)}、${f4(ba)}），差距 ${f4(Math.hypot(w - wa, b - ba))}${Math.hypot(w - wa, b - ba) > 0.05 ? '：還沒完全收斂，可增加輪數或學習率' : ''}`, [plot(w, b, [lineSeg(wa, ba, 'done', true)]), lossPlot([{ pts: curve, color: 'active' }], 'MSE', 'half')], 7);
    return r.frames;
  },
};

// ---------------- 邏輯斯迴歸 ----------------
const twoClass = (seed: number, sep: number): { p: Pt; y: number }[] => {
  const g = parkMiller(seed);
  return Array.from({ length: 24 }, (_, i) => { const y = i % 2; const cx = y ? 6 : 3, cy = y ? 6 : 3; return { p: [cx + (g.real() - 0.5) * sep, cy + (g.real() - 0.5) * sep] as Pt, y }; });
};
const sigmoid = (z: number) => (z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)));
const logLoss = (z: number, y: number) => Math.max(z, 0) - y * z + Math.log1p(Math.exp(-Math.abs(z)));
const logistic: AlgoDef = {
  id: 'logistic-regression', name: '邏輯斯迴歸', en: 'Logistic Regression', cat,
  desc: '二元分類：先算線性分數 z = w₁x₁ + w₂x₂ + b，再用 sigmoid σ(z) = 1/(1 + e^(−z)) 轉成機率。以交叉熵 −[y log p + (1−y) log(1−p)] 為損失，梯度恰好是 (p − y)·x，用梯度下降更新。直接計算 log(σ(z)) 在 z 很大時會遇到 log(0) = −∞，所以改用等價的穩定形式 max(z, 0) − y·z + log(1 + e^(−|z|))；sigmoid 也依 z 的正負選擇不會溢位的寫法。決策邊界是直線 z = 0。',
  time: '每輪 O(n·d)', space: 'O(d)',
  code: ['w = 0，b = 0', 'repeat epochs 次:', '  z_i = w·x_i + b，p_i = σ(z_i)', '  損失 = mean(max(z,0) − y·z + log(1 + e^(−|z|)))   (穩定形式)', '  ∇w = mean((p_i − y_i)·x_i)，∇b = mean(p_i − y_i)', '  w −= η∇w，b −= η∇b', '預測：p ≥ 0.5 → 類別 1；邊界為 w·x + b = 0'],
  inputs: [inSelect('sep', '資料分布', [['3', '分得開'], ['6', '有重疊']]), inSelect('lr', '學習率 η', [['0.5', '0.5'], ['0.1', '0.1'], ['2', '2']]), inNum('epochs', '輪數', 300, 1, 3000, () => rnd.pick([100, 300, 1000])), seedIn()],
  run({ sep, lr, epochs, seed }) {
    const r = new Rec();
    const D = twoClass(seed, Number(sep));
    const n = D.length, eta = Number(lr);
    let w1 = 0, w2 = 0, b = 0;
    const loss = () => D.reduce((s, { p, y }) => s + logLoss(w1 * p[0] + w2 * p[1] + b, y), 0) / n;
    const acc = () => D.filter(({ p, y }) => (sigmoid(w1 * p[0] + w2 * p[1] + b) >= 0.5 ? 1 : 0) === y).length;
    const boundary = (): PlotPanel['segments'] => { if (Math.abs(w2) > 1e-9) return [{ x1: 0, y1: -b / w2, x2: 9, y2: -(w1 * 9 + b) / w2, color: 'swap', width: 2.5 }]; if (Math.abs(w1) > 1e-9) return [{ x1: -b / w1, y1: 0, x2: -b / w1, y2: 9, color: 'swap', width: 2.5 }]; return []; };
    const plot = (): PlotPanel => ({ type: 'plot', square: true, axes: true, bounds: [0, 9, 0, 9], points: D.map(({ p, y }) => ({ x: p[0], y: p[1], r: 5, color: (sigmoid(w1 * p[0] + w2 * p[1] + b) >= 0.5 ? 1 : 0) === y ? (y ? 'bad' : 'active') : 'special' })), segments: boundary(), title: '藍：類別 0，紅：類別 1，紫：目前分錯', w: 'half' });
    const curve: Pt[] = [[0, loss()]];
    r.snap(`w = 0、b = 0：每個點的機率都是 0.5，損失 = log 2 ≈ ${f4(loss())}`, [plot(), vars({ 損失: f4(loss()), 正確: `${acc()}/${n}` })], 1);
    const big = 40;
    r.snap(`數值穩定性：z = ${big}、y = 0 時，直接算 −log(1 − σ(z)) 得到 ${(-Math.log(1 - 1 / (1 + Math.exp(-big)))).toString()}（σ(z) 被捨入成 1）；穩定形式 max(z,0) − y·z + log(1+e^(−|z|)) = ${f4(logLoss(big, 0))}`, [plot(), table([['直接計算', String(-Math.log(1 - 1 / (1 + Math.exp(-big))))], ['穩定形式', String(f4(logLoss(big, 0)))]], { '0,1': 'bad', '1,1': 'done' }, { title: `z = ${big}, y = 0 的損失`, w: 'half' })], 4);
    const every = Math.max(1, Math.floor(epochs / 12));
    for (let ep = 1; ep <= epochs; ep++) {
      let g1 = 0, g2 = 0, gb = 0;
      for (const { p, y } of D) { const e = sigmoid(w1 * p[0] + w2 * p[1] + b) - y; g1 += e * p[0] / n; g2 += e * p[1] / n; gb += e / n; }
      w1 -= eta * g1; w2 -= eta * g2; b -= eta * gb;
      curve.push([ep, loss()]);
      if (ep <= 2 || ep % every === 0 || ep === epochs) r.snap(`第 ${ep} 輪：w = (${f3(w1)}, ${f3(w2)})、b = ${f3(b)}，損失 ${f4(loss())}，正確 ${acc()}/${n}`, [plot(), lossPlot([{ pts: [...curve], color: 'active' }], '交叉熵損失', 'half')], 6);
    }
    r.snap(`訓練完成：決策邊界 ${f3(w1)}·x₁ ${w2 < 0 ? '−' : '+'} ${f3(Math.abs(w2))}·x₂ ${b < 0 ? '−' : '+'} ${f3(Math.abs(b))} = 0，正確率 ${acc()}/${n}${acc() < n ? '（資料重疊時無法用直線完全分開）' : ''}`, [plot(), lossPlot([{ pts: curve, color: 'active' }], '交叉熵損失', 'half')], 7);
    return r.frames;
  },
};

// ---------------- 樸素貝氏 ----------------
const NB_TRAIN: [string, string][] = [['spam', 'free money now'], ['spam', 'win free prize now'], ['spam', 'claim your free money'], ['spam', 'cheap prize offer'], ['ham', 'meeting at noon'], ['ham', 'project meeting notes'], ['ham', 'lunch at noon tomorrow'], ['ham', 'your project report']];
const naiveBayes: AlgoDef = {
  id: 'naive-bayes', name: '樸素貝氏分類', en: 'Multinomial Naive Bayes', cat,
  desc: '用貝氏定理比較 P(類別 | 文字) ∝ P(類別)·∏P(字 | 類別)，「樸素」指假設每個字彼此獨立。很多小機率相乘會下溢成 0，所以改成加總對數機率。訓練資料沒出現過的字會讓 P(字 | 類別) = 0、log = −∞，整個類別被一票否決；拉普拉斯平滑在每個字的次數上加 α（通常為 1）解決這個問題。可以把 α 改成 0 觀察這個現象。',
  time: '訓練 O(總字數)，預測 O(字數·類別數)', space: 'O(字彙數·類別數)',
  code: ['prior[c] = log(類別 c 的文件數 / 總文件數)', 'count[c][w] = 字 w 在類別 c 出現的次數', 'logP(w | c) = log((count[c][w] + α) / (Σ_w count[c][w] + α·|V|))', '預測：score[c] = prior[c] + Σ_{w ∈ 訊息} logP(w | c)', '取 score 最大的類別；用對數避免連乘下溢', 'α = 0 時未見過的字 → log 0 = −∞'],
  inputs: [inText('msg', '要分類的訊息', 'free lunch meeting', () => rnd.pick(['free lunch meeting', 'win cheap money', 'project notes tomorrow', 'free coffee now', 'noon prize'])), inSelect('alpha', '平滑 α', [['1', '1（拉普拉斯平滑）'], ['0', '0（不平滑）'], ['0.5', '0.5']])],
  run({ msg, alpha }) {
    const r = new Rec();
    const a = Number(alpha);
    const classes = ['spam', 'ham'];
    const vocab = [...new Set(NB_TRAIN.flatMap(([, t]) => t.split(' ')))].sort();
    const words = String(msg).toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) throw new Error('訊息不可為空');
    const cnt: Record<string, Record<string, number>> = { spam: {}, ham: {} };
    const tot: Record<string, number> = { spam: 0, ham: 0 };
    for (const [c, t] of NB_TRAIN) for (const w of t.split(' ')) { cnt[c][w] = (cnt[c][w] ?? 0) + 1; tot[c]++; }
    r.snap(`訓練資料 ${NB_TRAIN.length} 封（垃圾 4、正常 4），字彙 ${vocab.length} 個`, [table(NB_TRAIN.map(([c, t]) => [c, t]), {}, { title: '訓練資料', colHeaders: ['類別', '內容'] })], 2);
    const prior = Object.fromEntries(classes.map((c) => [c, Math.log(NB_TRAIN.filter(([k]) => k === c).length / NB_TRAIN.length)]));
    const logp = (c: string, w: string) => { const num = (cnt[c][w] ?? 0) + a, den = tot[c] + a * vocab.length; return num === 0 ? -Infinity : Math.log(num / den); };
    const unseen = words.filter((w) => !vocab.includes(w));
    r.snap(`log P(字 | 類別) = log((次數 + ${a}) / (類別總字數 + ${a}×${vocab.length}))${unseen.length ? `；訊息中的 ${unseen.join('、')} 從沒出現在訓練資料中` : ''}`, [table(vocab.map((w) => [w, cnt.spam[w] ?? 0, cnt.ham[w] ?? 0, Number.isFinite(logp('spam', w)) ? f3(logp('spam', w)) : '−∞', Number.isFinite(logp('ham', w)) ? f3(logp('ham', w)) : '−∞']), Object.fromEntries(vocab.flatMap((w, i) => (words.includes(w) ? [[`${i},0`, 'swap' as Color]] : []))), { title: `類別總字數：spam ${tot.spam}、ham ${tot.ham}`, colHeaders: ['字', 'spam 次數', 'ham 次數', 'log P(·|spam)', 'log P(·|ham)'] })], 3);
    const score: Record<string, number> = {};
    for (const c of classes) {
      let s = prior[c];
      const terms: string[] = [`prior ${f3(prior[c])}`];
      for (const w of words) { const v = logp(c, w); s += v; terms.push(`${w}: ${Number.isFinite(v) ? f3(v) : '−∞'}`); }
      score[c] = s;
      r.snap(`${c}：${terms.join(' + ')} = ${Number.isFinite(s) ? f3(s) : '−∞'}`, [text(terms, `score[${c}]（對數加總）`), vars({ [`score[${c}]`]: Number.isFinite(s) ? f3(s) : '−∞' }, undefined, Number.isFinite(s) ? {} : { [`score[${c}]`]: 'bad' })], 4);
    }
    const pred = score.spam >= score.ham ? 'spam' : 'ham';
    const both = !Number.isFinite(score.spam) && !Number.isFinite(score.ham);
    const p = Number.isFinite(score.spam) && Number.isFinite(score.ham) ? 1 / (1 + Math.exp(score.ham - score.spam)) : NaN;
    r.snap(both ? '兩個類別都因為未見過的字得到 −∞，無法比較——這正是需要平滑的原因' : `預測為 ${pred}${Number.isNaN(p) ? '（另一類因未見過的字被一票否決為 −∞）' : `；換回機率 P(spam | 訊息) = ${f3(p)}`}`, [bars(classes.map((c) => (Number.isFinite(score[c]) ? -score[c] : 0)), { [classes.indexOf(pred)]: 'done' }, { labels: classes.map((c) => `${c}: ${Number.isFinite(score[c]) ? f3(score[c]) : '−∞'}`), title: '−score（越短越可能）' }), vars({ 預測: both ? '無法判斷' : pred }, undefined, { 預測: both ? 'bad' : 'done' })], 5);
    return r.frames;
  },
};

// ---------------- 決策樹 ----------------
const treeData = (kind: string, seed: number): { p: Pt; y: number }[] => {
  const g = parkMiller(seed);
  return Array.from({ length: 30 }, () => {
    const x = g.real() * 10, y = g.real() * 10;
    const c = kind === 'xor' ? ((x < 5) !== (y < 5) ? 1 : 0) : kind === 'diag' ? (x + y > 10 ? 1 : 0) : (x > 6 ? 2 : y > 5 ? 1 : 0);
    return { p: [+x.toFixed(1), +y.toFixed(1)] as Pt, y: c };
  });
};
type TNode = { id: number; idx: number[]; depth: number; feat?: number; thr?: number; left?: TNode; right?: TNode; label?: number; gini: number; box: [number, number, number, number] };
const decisionTree: AlgoDef = {
  id: 'decision-tree', name: '決策樹學習', en: 'Decision Tree (CART, Gini)', cat,
  desc: '遞迴地把資料切成兩半：在每個節點嘗試所有特徵與所有可能的門檻（相鄰值的中點），選讓子節點加權 Gini 不純度 Σ(n_k/n)·(1 − Σp²) 最低的切法。停止條件：節點已經純淨、達到最大深度、或樣本數少於 2；葉節點預測多數類別。平手規則固定：分數相同時選特徵編號較小、再選門檻較小者；多數決平手時選類別編號較小者。圖中以矩形顯示每次切分。',
  time: 'O(d·n² · 深度)（教學版）', space: 'O(n)',
  code: ['build(節點樣本, 深度):', '  if 純淨 或 深度 == 上限 或 樣本 < 2: 成為葉子（多數類別，平手取編號小）', '  for 每個特徵 f、每個門檻 t（相鄰值中點）:', '    分數 = (n_L/n)·Gini(L) + (n_R/n)·Gini(R)', '  取分數最低者（平手：f 小、t 小）', '  左子 = build(x_f ≤ t)，右子 = build(x_f > t)', 'Gini(S) = 1 − Σ_k p_k²'],
  inputs: [inSelect('data', '資料', [['blocks', '三塊區域（3 類）'], ['xor', 'XOR（對角相同類）'], ['diag', '斜線分界']]), inSelect('depth', '最大深度', [['2', '2'], ['1', '1'], ['3', '3'], ['4', '4']]), seedIn(3)],
  run({ data, depth, seed }) {
    const r = new Rec();
    const D = treeData(data, seed);
    const maxD = Number(depth);
    const K = Math.max(...D.map((d) => d.y)) + 1;
    const gini = (idx: number[]) => { if (!idx.length) return 0; const c = new Array(K).fill(0); idx.forEach((i) => c[D[i].y]++); return 1 - c.reduce((s, v) => s + (v / idx.length) ** 2, 0); };
    const major = (idx: number[]) => { const c = new Array(K).fill(0); idx.forEach((i) => c[D[i].y]++); return c.indexOf(Math.max(...c)); };
    let nid = 0;
    const rects: { box: [number, number, number, number]; color: Color }[] = [];
    const splits: PlotPanel['segments'] = [];
    const root: TNode = { id: nid++, idx: D.map((_, i) => i), depth: 0, gini: 0, box: [0, 10, 0, 10] };
    const plot = (hl?: TNode): PlotPanel => ({ type: 'plot', square: true, axes: true, bounds: [0, 10, 0, 10], polygons: [...rects.map((q) => ({ pts: [[q.box[0], q.box[2]], [q.box[1], q.box[2]], [q.box[1], q.box[3]], [q.box[0], q.box[3]]] as Pt[], color: q.color, fill: true })), ...(hl ? [{ pts: [[hl.box[0], hl.box[2]], [hl.box[1], hl.box[2]], [hl.box[1], hl.box[3]], [hl.box[0], hl.box[3]]] as Pt[], color: 'swap' as Color }] : [])], segments: [...splits!], points: D.map(({ p, y }, i) => ({ x: p[0], y: p[1], r: hl?.idx.includes(i) ? 5 : 3.5, color: CL[y % CL.length] })), w: 'half' });
    const treePanel = (): GraphPanel => {
      const nodes: GNode[] = [], edges: GEdge[] = [];
      const place = (t: TNode, x: number, span: number) => {
        nodes.push({ id: 'n' + t.id, x, y: t.depth * 80, label: t.feat === undefined ? (t.label !== undefined ? `類${t.label}` : '?') : `x${t.feat + 1}≤${t.thr}`, sub: `n=${t.idx.length} g=${f3(t.gini)}`, color: t.feat === undefined ? (t.label !== undefined ? CL[t.label % CL.length] : 'muted') : 'default', shape: 'rect', r: 26 });
        if (t.left) { place(t.left, x - span / 2, span / 2); edges.push({ from: 'n' + t.id, to: 'n' + t.left.id, label: '是' }); }
        if (t.right) { place(t.right, x + span / 2, span / 2); edges.push({ from: 'n' + t.id, to: 'n' + t.right.id, label: '否' }); }
      };
      place(root, 0, 240);
      return { type: 'graph', nodes, edges, height: 90 + maxD * 85, w: 'half' };
    };
    const build = (t: TNode) => {
      t.gini = gini(t.idx);
      const pure = t.gini < 1e-12;
      if (pure || t.depth >= maxD || t.idx.length < 2) {
        t.label = major(t.idx);
        rects.push({ box: t.box, color: CL[t.label % CL.length] });
        r.snap(`節點（${t.idx.length} 個樣本，Gini ${f3(t.gini)}）成為葉子：${pure ? '已經純淨' : t.depth >= maxD ? `達到最大深度 ${maxD}` : '樣本太少'}，預測類別 ${t.label}`, [plot(t), treePanel()], 2);
        return;
      }
      let best: { f: number; thr: number; s: number } | null = null;
      for (let f = 0; f < 2; f++) {
        const vals = [...new Set(t.idx.map((i) => D[i].p[f]))].sort((a, b) => a - b);
        for (let k = 0; k + 1 < vals.length; k++) {
          const thr = +((vals[k] + vals[k + 1]) / 2).toFixed(2);
          const L = t.idx.filter((i) => D[i].p[f] <= thr), R = t.idx.filter((i) => D[i].p[f] > thr);
          const s = (L.length / t.idx.length) * gini(L) + (R.length / t.idx.length) * gini(R);
          if (!best || s < best.s - 1e-12) best = { f, thr, s };
        }
      }
      if (!best) { t.label = major(t.idx); rects.push({ box: t.box, color: CL[t.label % CL.length] }); return; }
      t.feat = best.f; t.thr = best.thr;
      const [x0, x1, y0, y1] = t.box;
      splits!.push(best.f === 0 ? { x1: best.thr, y1: y0, x2: best.thr, y2: y1, color: 'swap', width: 2.5 } : { x1: x0, y1: best.thr, x2: x1, y2: best.thr, color: 'swap', width: 2.5 });
      t.left = { id: nid++, idx: t.idx.filter((i) => D[i].p[best!.f] <= best!.thr), depth: t.depth + 1, gini: 0, box: best.f === 0 ? [x0, best.thr, y0, y1] : [x0, x1, y0, best.thr] };
      t.right = { id: nid++, idx: t.idx.filter((i) => D[i].p[best!.f] > best!.thr), depth: t.depth + 1, gini: 0, box: best.f === 0 ? [best.thr, x1, y0, y1] : [x0, x1, best.thr, y1] };
      r.snap(`節點（${t.idx.length} 個樣本，Gini ${f3(t.gini)}）：最佳切分 x${best.f + 1} ≤ ${best.thr}，子節點加權 Gini ${f3(best.s)}（左 ${t.left.idx.length}、右 ${t.right.idx.length}）`, [plot(t), treePanel()], 5);
      build(t.left);
      build(t.right);
    };
    build(root);
    const predict = (p: Pt) => { let t = root; while (t.feat !== undefined) t = p[t.feat] <= t.thr! ? t.left! : t.right!; return t.label!; };
    const accN = D.filter((d) => predict(d.p) === d.y).length;
    r.snap(`完成：訓練正確率 ${accN}/${D.length}${accN < D.length ? (data === 'diag' ? '（斜線邊界只能用階梯狀的軸對齊切分近似）' : data === 'xor' ? '（XOR 的第一刀單獨看幾乎降不了 Gini，貪婪地一次只看一刀不一定選得好；加深深度可改善）' : '（深度不夠）') : ''}`, [plot(), treePanel()], 6);
    return r.frames;
  },
};

// ---------------- DBSCAN ----------------
const dbData = (seed: number): Pt[] => {
  const g = parkMiller(seed);
  const pts: Pt[] = [];
  for (const [cx, cy, n] of [[3, 3, 9], [7.5, 7, 9], [7, 2.5, 6]] as const) for (let i = 0; i < n; i++) pts.push([+(cx + (g.real() - 0.5) * 2.4).toFixed(2), +(cy + (g.real() - 0.5) * 2.4).toFixed(2)]);
  for (let i = 0; i < 5; i++) pts.push([+(g.real() * 10).toFixed(2), +(g.real() * 10).toFixed(2)]);
  return pts;
};
const dbscan: AlgoDef = {
  id: 'dbscan', name: '密度式分群', en: 'DBSCAN', cat,
  desc: '以密度定義群集：半徑 ε 內至少有 minPts 個點（本頁規定「包含自己」）的點是核心點。從一個尚未分類的核心點出發做 BFS：鄰域內的點都屬於同一群，其中的核心點繼續擴張；非核心但在某核心點鄰域內的是邊界點；都不屬於的是雜訊。不需要事先指定群數，也能找出任意形狀的群，但對 ε 與 minPts 很敏感。',
  time: 'O(n²)（無空間索引）', space: 'O(n)',
  code: ['N(p) = 距離 ≤ ε 的所有點（含 p 自己）', '核心點：|N(p)| ≥ minPts', 'for 每個未分類的核心點 p:', '  新群 c；佇列 = [p]', '  while 佇列不空: q = 取出；for r in N(q):', '    若 r 未分類：標為 c；若 r 是核心點 → 入列', '其餘未分類的點為雜訊'],
  inputs: [inSelect('eps', 'ε', [['1.2', '1.2'], ['0.8', '0.8'], ['2', '2.0']]), inSelect('minPts', 'minPts（含自己）', [['4', '4'], ['3', '3'], ['6', '6']]), seedIn(11)],
  run({ eps: es, minPts: ms, seed }) {
    const r = new Rec();
    const P = dbData(seed);
    const eps = Number(es), minPts = Number(ms);
    const nb = P.map((p) => P.map((q, j) => (Math.hypot(p[0] - q[0], p[1] - q[1]) <= eps ? j : -1)).filter((j) => j >= 0));
    const core = nb.map((s) => s.length >= minPts);
    const lab = new Array(P.length).fill(-1);
    const plot = (hl = -1, frontier: number[] = []): PlotPanel => ({ type: 'plot', square: true, axes: true, bounds: [-0.5, 10.5, -0.5, 10.5], circles: hl >= 0 ? [{ x: P[hl][0], y: P[hl][1], r: eps, color: 'swap' }] : [], points: P.map(([x, y], i) => ({ x, y, r: core[i] ? 6 : 4, color: (lab[i] >= 0 ? CL[lab[i] % CL.length] : frontier.includes(i) ? 'frontier' : 'muted') as Color })), title: '大點：核心點；灰：尚未分類' });
    r.snap(`${P.length} 個點；ε = ${eps}、minPts = ${minPts}（含自己）：${core.filter(Boolean).length} 個核心點`, [plot()], 2);
    let c = -1;
    for (let i = 0; i < P.length; i++) {
      if (lab[i] >= 0 || !core[i]) continue;
      c++;
      lab[i] = c;
      const q = [i];
      r.snap(`從核心點 ${i} 開始新的第 ${c + 1} 群（鄰域內 ${nb[i].length} 點）`, [plot(i, q)], 4);
      let step = 0;
      for (let k = 0; k < q.length; k++) {
        const cur = q[k];
        const added: number[] = [];
        for (const j of nb[cur]) if (lab[j] < 0) { lab[j] = c; added.push(j); if (core[j]) q.push(j); }
        if (added.length && step++ < 6) r.snap(`點 ${cur} 的 ε 鄰域加入 ${added.join('、')}${added.some((j) => core[j]) ? `；其中核心點 ${added.filter((j) => core[j]).join('、')} 會繼續擴張` : '（都是邊界點，不再擴張）'}`, [plot(cur, q.slice(k + 1))], 6);
      }
      r.snap(`第 ${c + 1} 群完成：${lab.filter((v) => v === c).length} 個點`, [plot()], 4);
    }
    const noise = lab.filter((v) => v < 0).length, border = lab.filter((v, i) => v >= 0 && !core[i]).length;
    r.snap(`共 ${c + 1} 群；核心點 ${core.filter(Boolean).length}、邊界點 ${border}、雜訊 ${noise}（灰）`, [plot()], 7);
    return r.frames;
  },
};

// ---------------- 階層式凝聚分群 ----------------
const aggData = (seed: number): Pt[] => {
  const g = parkMiller(seed);
  const pts: Pt[] = [];
  for (const [cx, cy, n] of [[2.5, 3, 4], [7, 7.5, 4], [7.5, 2.5, 3]] as const) for (let i = 0; i < n; i++) pts.push([+(cx + (g.real() - 0.5) * 2.6).toFixed(1), +(cy + (g.real() - 0.5) * 2.6).toFixed(1)]);
  return pts;
};
const agglomerative: AlgoDef = {
  id: 'agglomerative-clustering', name: '階層式凝聚分群', en: 'Agglomerative Hierarchical Clustering', cat,
  desc: '一開始每個點自成一群，每次合併「距離最近」的兩群，直到只剩一群，合併過程畫成樹狀圖（dendrogram），在任意高度切開就得到相應群數。兩群間的距離要先定義：single linkage 取最近的兩點（容易形成長鏈）、complete linkage 取最遠的兩點（群較緊密）、average linkage 取所有點對的平均。用最小堆存放所有群對的距離，合併後過時的項目在取出時略過（延遲刪除）。',
  time: 'O(n² log n)', space: 'O(n²)',
  code: ['每個點自成一群；把所有群對 (距離, A, B) 放進最小堆', 'repeat n − 1 次:', '  取出堆頂；若 A 或 B 已被合併 → 過時，略過', '  合併 A、B 成新群 C（記錄高度 = 距離）', '  對每個現存群 D：計算 dist(C, D) 並推入堆', 'single = min、complete = max、average = 所有點對平均', '在樹狀圖上切開 → k 群'],
  inputs: [inSelect('link', '連結方式', [['single', 'single（最近點）'], ['complete', 'complete（最遠點）'], ['average', 'average（平均）']]), inNum('k', '最後切成幾群', 3, 1, 11, () => rnd.int(2, 4)), seedIn(5)],
  run({ link, k, seed }) {
    const r = new Rec();
    const P = aggData(seed);
    const n = P.length;
    const d = (i: number, j: number) => Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]);
    const clusters = new Map<number, number[]>(P.map((_, i) => [i, [i]]));
    const linkD = (A: number[], B: number[]) => { const ds = A.flatMap((i) => B.map((j) => d(i, j))); return link === 'single' ? Math.min(...ds) : link === 'complete' ? Math.max(...ds) : ds.reduce((s, v) => s + v, 0) / ds.length; };
    type Item = { dist: number; a: number; b: number };
    const heap: Item[] = [];
    const less = (x: Item, y: Item) => x.dist < y.dist || (x.dist === y.dist && (x.a < y.a || (x.a === y.a && x.b < y.b)));
    const push = (it: Item) => { heap.push(it); let i = heap.length - 1; while (i > 0 && less(it, heap[(i - 1) >> 1])) { heap[i] = heap[(i - 1) >> 1]; i = (i - 1) >> 1; } heap[i] = it; };
    const pop = () => { const top = heap[0], last = heap.pop()!; if (heap.length) { let i = 0; for (;;) { const l = 2 * i + 1, rr = l + 1; let m = i, best = last; if (l < heap.length && less(heap[l], best)) { best = heap[l]; m = l; } if (rr < heap.length && less(heap[rr], best)) { best = heap[rr]; m = rr; } if (m === i) break; heap[i] = heap[m]; i = m; } heap[i] = last; } return top; };
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) push({ dist: linkD([i], [j]), a: i, b: j });
    const height: Record<number, number> = {}, kids: Record<number, [number, number]> = {};
    let next = n;
    const colorOf = () => { const m = new Map<number, number>(); [...clusters.keys()].forEach((cid, ci) => clusters.get(cid)!.forEach((i) => m.set(i, ci))); return m; };
    const plot = (hl: number[] = []): PlotPanel => { const m = colorOf(); return { type: 'plot', square: true, axes: true, bounds: [0, 10, 0, 10], points: P.map(([x, y], i) => ({ x, y, r: hl.includes(i) ? 7 : 5, label: String(i), color: CL[m.get(i)! % CL.length] })), w: 'half' }; };
    const order: number[] = [];
    const dendro = (cut?: number): PlotPanel => {
      order.length = 0;
      const walk = (c: number) => { if (c < n) order.push(c); else { walk(kids[c][0]); walk(kids[c][1]); } };
      [...clusters.keys()].forEach(walk);
      const xs: Record<number, number> = {};
      order.forEach((c, i) => { xs[c] = i; });
      const segs: PlotPanel['segments'] = [];
      const pos = (c: number): [number, number] => { if (c < n) return [xs[c], 0]; const [a, b] = kids[c]; const pa = pos(a), pb = pos(b); const h = height[c]; segs!.push({ x1: pa[0], y1: pa[1], x2: pa[0], y2: h, color: 'active', width: 2 }, { x1: pb[0], y1: pb[1], x2: pb[0], y2: h, color: 'active', width: 2 }, { x1: pa[0], y1: h, x2: pb[0], y2: h, color: 'active', width: 2 }); return [(pa[0] + pb[0]) / 2, h]; };
      [...clusters.keys()].forEach(pos);
      const H = Math.max(1, ...Object.values(height));
      if (cut !== undefined) segs!.push({ x1: -0.5, y1: cut, x2: n - 0.5, y2: cut, color: 'bad', dashed: true, width: 1.5 });
      return { type: 'plot', axes: true, bounds: [-0.7, n - 0.3, 0, H * 1.1], segments: segs, points: order.map((c, i) => ({ x: i, y: 0, r: 3, label: String(c), color: 'muted' as Color })), title: '樹狀圖（高度 = 合併距離）', w: 'half' };
    };
    r.snap(`${n} 個點各自成一群；${n * (n - 1) / 2} 個點對距離放進最小堆（${link} linkage）`, [plot(), dendro()], 1);
    const merges: number[] = [];
    while (clusters.size > 1) {
      const it = pop();
      if (!clusters.has(it.a) || !clusters.has(it.b)) continue;
      const A = clusters.get(it.a)!, B = clusters.get(it.b)!;
      const id = next++;
      clusters.delete(it.a); clusters.delete(it.b);
      clusters.set(id, [...A, ...B]);
      height[id] = it.dist; kids[id] = [it.a, it.b];
      merges.push(it.dist);
      for (const [cid, mem] of clusters) if (cid !== id) push({ dist: linkD(mem, [...A, ...B]), a: Math.min(cid, id), b: Math.max(cid, id) });
      r.snap(`合併 {${A.join(',')}} 與 {${B.join(',')}}（距離 ${f3(it.dist)}），剩 ${clusters.size} 群`, [plot([...A, ...B]), dendro()], 4);
    }
    const K = Math.max(1, Math.min(k, n));
    const cut = K >= n ? 0 : K === 1 ? merges[merges.length - 1] + 0.01 : (merges[n - K - 1] + merges[n - K]) / 2;
    const groups = (() => { const m = new Map<number, number[]>(P.map((_, i) => [i, [i]])); let id = n; for (let s = 0; s < n - K; s++) { const [a, b] = kids[id]; m.set(id, [...m.get(a)!, ...m.get(b)!]); m.delete(a); m.delete(b); id++; } return [...m.values()]; })();
    const cmap = new Map<number, number>();
    groups.forEach((g, gi) => g.forEach((i) => cmap.set(i, gi)));
    r.snap(`在高度 ${f3(cut)} 切開樹狀圖得到 ${K} 群：${groups.map((g) => `{${g.join(',')}}`).join(' ')}`, [{ type: 'plot', square: true, axes: true, bounds: [0, 10, 0, 10], points: P.map(([x, y], i) => ({ x, y, r: 5, label: String(i), color: CL[cmap.get(i)! % CL.length] })), w: 'half' }, dendro(cut)], 7);
    return r.frames;
  },
};

// ---------------- PCA ----------------
const pcaData = (kind: string, seed: number): Pt[] => {
  const g = parkMiller(seed);
  return Array.from({ length: 20 }, () => { const t = (g.real() - 0.5) * 6, e = (g.real() - 0.5) * 1.6; const x = 5 + t + e * 0.3, y = 4 + 0.6 * t + e; return kind === 'scaled' ? [x * 10, y] : [x, y]; });
};
const pca: AlgoDef = {
  id: 'pca', name: '主成分分析', en: 'Principal Component Analysis', cat,
  desc: '找出資料變異最大的方向。步驟：①中心化——每個特徵減去平均；（可選）②標準化——再除以標準差，讓單位不同的特徵公平比較；③計算共變異數矩陣 C；④C 的特徵向量就是主成分方向，特徵值是該方向上的變異量，比例即「解釋變異」。最後把資料投影到第一主成分，從 2 維降成 1 維。沒有標準化時，數值範圍大的特徵（例如被放大 10 倍的 x）會主導第一主成分。',
  time: 'O(n·d² + d³)', space: 'O(d²)',
  code: ['μ = 各特徵平均；X ← X − μ           (中心化)', '（標準化：X ← X / σ）', 'C = XᵀX / (n − 1)                  (共變異數矩陣)', 'C 的特徵值 λ₁ ≥ λ₂ 與特徵向量 v₁、v₂', '解釋變異 = λᵢ / (λ₁ + λ₂)；檢查 λ₁ + λ₂ = trace(C)', '投影：z = X·v₁（降成 1 維）'],
  inputs: [inSelect('data', '資料', [['plain', '兩個特徵尺度相近'], ['scaled', 'x 被放大 10 倍']]), inSelect('std', '前處理', [['center', '只中心化'], ['standard', '中心化 + 標準化']]), seedIn(8)],
  run({ data, std, seed }) {
    const r = new Rec();
    const P = pcaData(data, seed);
    const n = P.length;
    const mu = [P.reduce((s, p) => s + p[0], 0) / n, P.reduce((s, p) => s + p[1], 0) / n];
    let X = P.map(([x, y]) => [x - mu[0], y - mu[1]] as Pt);
    const sd = [Math.sqrt(X.reduce((s, p) => s + p[0] ** 2, 0) / (n - 1)), Math.sqrt(X.reduce((s, p) => s + p[1] ** 2, 0) / (n - 1))];
    const bounds = (pts: Pt[]): [number, number, number, number] => { const m = Math.max(...pts.flatMap((p) => [Math.abs(p[0]), Math.abs(p[1])])) * 1.2 || 1; return [-m, m, -m, m]; };
    r.snap(`平均 μ = (${f3(mu[0])}, ${f3(mu[1])})，標準差 σ = (${f3(sd[0])}, ${f3(sd[1])})；先中心化`, [{ type: 'plot', axes: true, square: true, bounds: [Math.min(...P.map((p) => p[0])) - 1, Math.max(...P.map((p) => p[0])) + 1, Math.min(...P.map((p) => p[1])) - 1, Math.max(...P.map((p) => p[1])) + 1], points: [...P.map(([x, y]) => ({ x, y, r: 4, color: 'active' as Color })), { x: mu[0], y: mu[1], r: 7, color: 'bad', label: 'μ' }], title: '原始資料', w: 'half' }, { type: 'plot', axes: true, square: true, bounds: bounds(X), points: X.map(([x, y]) => ({ x, y, r: 4, color: 'active' as Color })), title: '中心化後', w: 'half' }], 1);
    if (std === 'standard') { X = X.map(([x, y]) => [x / sd[0], y / sd[1]] as Pt); r.snap('再除以各自的標準差：兩個特徵的變異都變成 1', [{ type: 'plot', axes: true, square: true, bounds: bounds(X), points: X.map(([x, y]) => ({ x, y, r: 4, color: 'active' as Color })), title: '標準化後', w: 'half' }], 2); }
    const a = X.reduce((s, p) => s + p[0] ** 2, 0) / (n - 1), b = X.reduce((s, p) => s + p[0] * p[1], 0) / (n - 1), c = X.reduce((s, p) => s + p[1] ** 2, 0) / (n - 1);
    r.snap(`共變異數矩陣 C = [${f3(a)} ${f3(b)}; ${f3(b)} ${f3(c)}]`, [table([[f3(a), f3(b)], [f3(b), f3(c)]], {}, { title: 'C', rowHeaders: ['x', 'y'], colHeaders: ['x', 'y'], w: 'half' })], 3);
    const tr = a + c, det = a * c - b * b, disc = Math.sqrt(Math.max(0, (tr / 2) ** 2 - det));
    const l1 = tr / 2 + disc, l2 = tr / 2 - disc;
    let v1: Pt = Math.abs(b) > 1e-12 ? [l1 - c, b] : a >= c ? [1, 0] : [0, 1];
    const nv = Math.hypot(v1[0], v1[1]);
    v1 = [v1[0] / nv, v1[1] / nv];
    if (v1[0] < 0) v1 = [-v1[0], -v1[1]];
    const v2: Pt = [-v1[1], v1[0]];
    const B = bounds(X);
    const arrow = (v: Pt, s: number, color: Color) => ({ x1: 0, y1: 0, x2: v[0] * s, y2: v[1] * s, color, width: 3 });
    r.snap(`特徵值 λ₁ = ${f3(l1)}、λ₂ = ${f3(l2)}（和 ${f3(l1 + l2)} = trace(C) ${f3(tr)}）；v₁ = (${f3(v1[0])}, ${f3(v1[1])}) 解釋 ${f3((l1 / (l1 + l2)) * 100)}% 的變異`, [{ type: 'plot', axes: true, square: true, bounds: B, points: X.map(([x, y]) => ({ x, y, r: 4, color: 'active' as Color })), segments: [arrow(v1, 2 * Math.sqrt(l1), 'bad'), arrow(v2, 2 * Math.sqrt(Math.max(0, l2)), 'good')], title: '紅：第一主成分；綠：第二主成分（長度 2√λ）', w: 'half' }, bars([f3((l1 / (l1 + l2)) * 100), f3((l2 / (l1 + l2)) * 100)], { 0: 'bad', 1: 'good' }, { labels: ['PC1 %', 'PC2 %'], title: '解釋變異比例', w: 'half' })], 5);
    const z = X.map(([x, y]) => x * v1[0] + y * v1[1]);
    r.snap(`投影到第一主成分：每個點變成一個數 z = x·v₁，保留了 ${f3((l1 / (l1 + l2)) * 100)}% 的變異${data === 'scaled' && std === 'center' ? '。注意：x 被放大 10 倍後，只中心化時第一主成分幾乎就是 x 軸——改用標準化比較看看' : ''}`, [{ type: 'plot', axes: true, square: true, bounds: B, points: [...X.map(([x, y]) => ({ x, y, r: 3, color: 'muted' as Color })), ...z.map((t) => ({ x: t * v1[0], y: t * v1[1], r: 4, color: 'bad' as Color }))], segments: X.map(([x, y], i) => ({ x1: x, y1: y, x2: z[i] * v1[0], y2: z[i] * v1[1], color: 'muted' as Color, dashed: true, width: 1 })), w: 'half' }, bars(z.map((t) => f3(t)), {}, { title: '一維投影 z', w: 'half' })], 6);
    return r.frames;
  },
};

// ---------------- 反向傳播 ----------------
const XOR: [number, number, number][] = [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]];
const backprop: AlgoDef = {
  id: 'backpropagation', name: '反向傳播', en: 'Backpropagation', cat,
  desc: '訓練神經網路時需要損失對每個權重的偏微分。反向傳播用連鎖律從輸出往回算：輸出層的誤差 δ = (ŷ − y)·σ′，隱藏層的 δ 等於下一層 δ 乘上權重再乘自己的 σ′，每個權重的梯度就是「輸入 × 下一層 δ」。這裡用 2-2-1 的 sigmoid 網路學 XOR。實作反向傳播最常見的錯誤是公式寫錯，所以先做梯度檢查：把每個參數加減 ε，用中央差分 (L(θ+ε) − L(θ−ε)) / 2ε 估計梯度，與反向傳播的結果比對。',
  time: '每次前向＋反向 O(參數數)', space: 'O(參數數)',
  code: ['前向：h = σ(W₁x + b₁)，ŷ = σ(w₂·h + b₂)，L = ½(ŷ − y)²', '輸出層：δ₂ = (ŷ − y)·ŷ(1 − ŷ)', '  ∂L/∂w₂ = δ₂·h，∂L/∂b₂ = δ₂', '隱藏層：δ₁ = (w₂·δ₂) ⊙ h(1 − h)', '  ∂L/∂W₁ = δ₁·xᵀ，∂L/∂b₁ = δ₁', '梯度檢查：(L(θ+ε) − L(θ−ε)) / 2ε ≈ 反向傳播的值', '更新：θ −= η·∇θ'],
  inputs: [seedIn(3), inSelect('lr', '學習率 η', [['2', '2'], ['0.5', '0.5'], ['5', '5']]), inNum('epochs', '訓練輪數', 2000, 0, 20000, () => rnd.pick([500, 2000, 5000]))],
  run({ seed, lr, epochs }) {
    const r = new Rec();
    const g = parkMiller(seed);
    const init = () => (g.real() - 0.5) * 2;
    let th = Array.from({ length: 9 }, init); // W1(4) b1(2) w2(2) b2(1)
    const names = ['W₁₁', 'W₁₂', 'W₂₁', 'W₂₂', 'b₁₁', 'b₁₂', 'w₂₁', 'w₂₂', 'b₂'];
    const sg = (z: number) => 1 / (1 + Math.exp(-z));
    const forward = (t: number[], x: number[]) => { const h = [sg(t[0] * x[0] + t[1] * x[1] + t[4]), sg(t[2] * x[0] + t[3] * x[1] + t[5])]; const o = sg(t[6] * h[0] + t[7] * h[1] + t[8]); return { h, o }; };
    const loss = (t: number[]) => XOR.reduce((s, [a, b, y]) => s + 0.5 * (forward(t, [a, b]).o - y) ** 2, 0);
    const grad = (t: number[]) => {
      const G = new Array(9).fill(0);
      for (const [a, b, y] of XOR) {
        const { h, o } = forward(t, [a, b]);
        const d2 = (o - y) * o * (1 - o);
        G[6] += d2 * h[0]; G[7] += d2 * h[1]; G[8] += d2;
        const d1 = [t[6] * d2 * h[0] * (1 - h[0]), t[7] * d2 * h[1] * (1 - h[1])];
        G[0] += d1[0] * a; G[1] += d1[0] * b; G[2] += d1[1] * a; G[3] += d1[1] * b; G[4] += d1[0]; G[5] += d1[1];
      }
      return G;
    };
    const net = (x: number[], t: number[]): GraphPanel => {
      const { h, o } = forward(t, x);
      const nodes: GNode[] = [{ id: 'x1', x: 0, y: 0, label: String(x[0]), sub: 'x₁', color: 'active' }, { id: 'x2', x: 0, y: 120, label: String(x[1]), sub: 'x₂', color: 'active' }, { id: 'h1', x: 160, y: 0, label: f3(h[0]).toString(), sub: 'h₁', color: 'frontier' }, { id: 'h2', x: 160, y: 120, label: f3(h[1]).toString(), sub: 'h₂', color: 'frontier' }, { id: 'o', x: 320, y: 60, label: f3(o).toString(), sub: 'ŷ', color: 'done' }];
      const edges: GEdge[] = [{ from: 'x1', to: 'h1', label: String(f3(t[0])) }, { from: 'x2', to: 'h1', label: String(f3(t[1])) }, { from: 'x1', to: 'h2', label: String(f3(t[2])) }, { from: 'x2', to: 'h2', label: String(f3(t[3])) }, { from: 'h1', to: 'o', label: String(f3(t[6])) }, { from: 'h2', to: 'o', label: String(f3(t[7])) }].map((e) => ({ ...e, directed: true }));
      return { type: 'graph', nodes, edges, height: 200, title: `輸入 (${x.join(', ')}) 的前向計算`, w: 'half' };
    };
    const { h, o } = forward(th, [1, 0]);
    r.snap(`隨機初始化 9 個參數；輸入 (1, 0)：h = (${f3(h[0])}, ${f3(h[1])})，ŷ = ${f3(o)}，總損失 ${f4(loss(th))}`, [net([1, 0], th), table([th.map(f3)], {}, { colHeaders: names, title: '參數' })], 1);
    const d2 = (o - 1) * o * (1 - o);
    r.snap(`反向（輸入 (1, 0)、目標 1）：δ₂ = (ŷ − y)·ŷ(1 − ŷ) = ${f4(d2)}；δ₁ = (${f4(th[6] * d2 * h[0] * (1 - h[0]))}, ${f4(th[7] * d2 * h[1] * (1 - h[1]))})`, [net([1, 0], th), vars({ 'δ₂': f4(d2), 'δ₁₁': f4(th[6] * d2 * h[0] * (1 - h[0])), 'δ₁₂': f4(th[7] * d2 * h[1] * (1 - h[1])) })], 4);
    const G = grad(th), eps = 1e-5;
    const num = th.map((_, i) => { const p = [...th], m = [...th]; p[i] += eps; m[i] -= eps; return (loss(p) - loss(m)) / (2 * eps); });
    const rel = G.map((v, i) => Math.abs(v - num[i]) / Math.max(1e-12, Math.abs(v) + Math.abs(num[i])));
    r.snap(`梯度檢查（ε = 1e-5，四筆資料加總）：最大相對誤差 ${Math.max(...rel).toExponential(2)}${Math.max(...rel) < 1e-6 ? '，反向傳播的公式正確' : '，有問題！'}`, [table(th.map((_, i) => [names[i], G[i].toExponential(5), num[i].toExponential(5), rel[i].toExponential(1)]), Object.fromEntries(rel.map((v, i) => [`${i},3`, (v < 1e-6 ? 'done' : 'bad') as Color])), { colHeaders: ['參數', '反向傳播', '中央差分', '相對誤差'] })], 6);
    const curve: Pt[] = [[0, loss(th)]];
    const eta = Number(lr), every = Math.max(1, Math.floor(epochs / 10));
    for (let ep = 1; ep <= epochs; ep++) {
      const gr = grad(th);
      th = th.map((v, i) => v - eta * gr[i]);
      if (ep % Math.max(1, Math.floor(epochs / 200)) === 0) curve.push([ep, loss(th)]);
      if (ep % every === 0) r.snap(`第 ${ep} 輪：損失 ${f4(loss(th))}；預測 ${XOR.map(([a, b]) => f3(forward(th, [a, b]).o)).join(' ')}（目標 0 1 1 0）`, [lossPlot([{ pts: [...curve], color: 'active' }], '總損失', 'half'), net([0, 1], th)], 7);
    }
    const preds = XOR.map(([a, b]) => forward(th, [a, b]).o);
    const ok = preds.every((p, i) => (p >= 0.5 ? 1 : 0) === XOR[i][2]);
    r.snap(`訓練 ${epochs} 輪後：預測 ${preds.map(f3).join(' ')}，${ok ? '四筆全部分類正確' : '尚未學會 XOR（可能卡在局部極小，換個種子或學習率試試）'}`, [lossPlot([{ pts: curve, color: 'active' }], '總損失', 'half'), table(XOR.map(([a, b, y], i) => [a, b, y, f3(preds[i])]), Object.fromEntries(preds.map((p, i) => [`${i},3`, ((p >= 0.5 ? 1 : 0) === XOR[i][2] ? 'done' : 'bad') as Color])), { colHeaders: ['x₁', 'x₂', '目標', '預測'], w: 'half' })], 7);
    return r.frames;
  },
};

// ---------------- SGD ----------------
const sgd: AlgoDef = {
  id: 'sgd', name: '隨機梯度下降', en: 'Stochastic Gradient Descent', cat,
  desc: '批次梯度下降每一步都要掃過全部資料；SGD 每次只用一筆（或一小批）資料估計梯度就更新，一輪（epoch）內更新 n 次。估計有雜訊，路徑會抖動，但每步便宜得多，而且雜訊有時能幫助跳出平坦區。每輪開始前把資料隨機洗牌（固定種子以便重現）。學習率太大會在最小值附近劇烈震盪甚至發散；太小則收斂很慢。右圖在 (w, b) 平面上比較兩者的路徑。',
  time: '每次更新 O(1)（單筆）', space: 'O(1)',
  code: ['w = b = 0', 'for epoch = 1 .. E:', '  洗牌（Fisher–Yates，固定種子）', '  for 每筆 (x_i, y_i):', '    e = w·x_i + b − y_i', '    w −= η·2e·x_i，b −= η·2e', '對照：批次 GD 每輪只更新一次（用全部資料的平均梯度）'],
  inputs: [inSelect('lr', '學習率 η', [['0.01', '0.01'], ['0.002', '0.002（慢）'], ['0.03', '0.03（震盪）']]), inNum('epochs', '輪數', 15, 1, 200, () => rnd.pick([5, 15, 40])), seedIn()],
  run({ lr, epochs, seed }) {
    const r = new Rec();
    const P = lineData('noisy', 9);
    const n = P.length, eta = Number(lr);
    const g = parkMiller(seed);
    const mse = (w: number, b: number) => P.reduce((s, [x, y]) => s + (w * x + b - y) ** 2, 0) / n;
    const sx = P.reduce((s, p) => s + p[0], 0), sy = P.reduce((s, p) => s + p[1], 0), sxx = P.reduce((s, p) => s + p[0] * p[0], 0), sxy = P.reduce((s, p) => s + p[0] * p[1], 0);
    const wa = (n * sxy - sx * sy) / (n * sxx - sx * sx), ba = (sy - wa * sx) / n;
    let w = 0, b = 0, gw = 0, gb = 0;
    const sPath: Pt[] = [[0, 0]], bPath: Pt[] = [[0, 0]];
    const sLoss: Pt[] = [[0, mse(0, 0)]], bLoss: Pt[] = [[0, mse(0, 0)]];
    const pathPlot = (): PlotPanel => ({ type: 'plot', axes: true, bounds: [-0.5, 3.5, -1.5, 3.5], curves: [{ pts: [...bPath], color: 'done', width: 2.5 }, { pts: [...sPath], color: 'bad', width: 1 }], points: [{ x: wa, y: ba, r: 6, color: 'special', label: '最佳' }, { x: w, y: b, r: 5, color: 'bad' }], title: '(w, b) 路徑：紅 SGD、綠批次 GD', w: 'half' });
    r.snap(`${n} 筆資料；最佳解 w = ${f3(wa)}、b = ${f3(ba)}。SGD 每輪更新 ${n} 次，批次 GD 每輪 1 次`, [pathPlot()], 1);
    for (let ep = 1; ep <= epochs; ep++) {
      const ord = P.map((_, i) => i);
      for (let i = n - 1; i > 0; i--) { const j = g.int(i + 1); [ord[i], ord[j]] = [ord[j], ord[i]]; }
      for (const i of ord) { const [x, y] = P[i]; const e = w * x + b - y; w -= eta * 2 * e * x; b -= eta * 2 * e; sPath.push([w, b]); }
      sLoss.push([ep, Math.min(mse(w, b), 1e4)]);
      gw = 0; gb = 0;
      const [bw, bb] = bPath[bPath.length - 1];
      for (const [x, y] of P) { const e = bw * x + bb - y; gw += (2 / n) * e * x; gb += (2 / n) * e; }
      bPath.push([bw - eta * gw, bb - eta * gb]);
      bLoss.push([ep, Math.min(mse(bw - eta * gw, bb - eta * gb), 1e4)]);
      if (!Number.isFinite(w) || Math.abs(w) > 1e4 || mse(w, b) > 1e6) { r.snap(`第 ${ep} 輪：SGD 的 MSE 爆增到 ${mse(w, b).toExponential(2)}，學習率太大而發散`, [lossPlot([{ pts: sLoss, color: 'bad' }, { pts: bLoss, color: 'done' }], 'MSE', 'half')], 6); return r.frames; }
      if (ep <= 3 || ep % Math.max(1, Math.floor(epochs / 8)) === 0 || ep === epochs) r.snap(`第 ${ep} 輪（洗牌順序 ${ord.slice(0, 6).join(',')}…）：SGD w = ${f3(w)}、b = ${f3(b)}，MSE ${f4(mse(w, b))}；批次 GD MSE ${f4(bLoss[bLoss.length - 1][1])}`, [pathPlot(), lossPlot([{ pts: [...sLoss], color: 'bad' }, { pts: [...bLoss], color: 'done' }], 'MSE（紅 SGD、綠批次 GD）', 'half')], 5);
    }
    const worse = mse(w, b) > mse(0, 0);
    r.snap(`${epochs} 輪後：SGD 的 MSE ${f4(mse(w, b))}、批次 GD 的 MSE ${f4(bLoss[bLoss.length - 1][1])}（最佳 ${f4(mse(wa, ba))}）。${worse ? '學習率太大：SGD 的單筆梯度步伐過猛，越震越遠' : `同樣的輪數 SGD 更新了 ${n} 倍的次數，但路徑抖動；學習率固定時會在最佳解附近持續晃動`}`, [pathPlot(), lossPlot([{ pts: sLoss, color: 'bad' }, { pts: bLoss, color: 'done' }], 'MSE', 'half')], 7);
    return r.frames;
  },
};

// ---------------- Adam ----------------
const ADAM_FN: Record<string, { f: (x: number, y: number) => number; g: (x: number, y: number) => Pt; label: string; start: Pt; bounds: [number, number, number, number] }> = {
  ellipse: { f: (x, y) => 0.1 * x * x + 2 * y * y, g: (x, y) => [0.2 * x, 4 * y], label: '細長碗 0.1x² + 2y²', start: [-4, 1.5], bounds: [-5, 2, -2, 2] },
  rosen: { f: (x, y) => (1 - x) ** 2 + 10 * (y - x * x) ** 2, g: (x, y) => [-2 * (1 - x) - 40 * x * (y - x * x), 20 * (y - x * x)], label: 'Rosenbrock (1−x)² + 10(y−x²)²', start: [-1.5, 2], bounds: [-2, 2, -1, 3] },
};
const adam: AlgoDef = {
  id: 'adam', name: 'Adam 最佳化器', en: 'Adam Optimizer', cat,
  desc: 'Adam 為每個參數維護兩個指數移動平均：m（梯度的一階動差，類似動量）與 v（梯度平方的二階動差），更新量為 η·m̂ / (√v̂ + ε)——梯度一直很大的方向步伐會被縮小，很小的方向會被放大，對細長的地形特別有效。m、v 從 0 開始，前幾步會被低估，所以要做偏差修正 m̂ = m/(1 − β₁ᵗ)、v̂ = v/(1 − β₂ᵗ)；第一步修正後 m̂ = g、v̂ = g²，更新量約為 η·sign(g)。注意 ε 加在根號外面。與同學習率的一般梯度下降比較路徑。',
  time: '每步 O(參數數)', space: 'O(參數數)',
  code: ['m = v = 0，t = 0', 'repeat:', '  t += 1；g = ∇f(θ)', '  m = β₁·m + (1 − β₁)·g', '  v = β₂·v + (1 − β₂)·g²', '  m̂ = m / (1 − β₁ᵗ)，v̂ = v / (1 − β₂ᵗ)   (偏差修正)', '  θ −= η · m̂ / (√v̂ + ε)                (ε 在根號外)'],
  inputs: [inSelect('fn', '目標函數', [['ellipse', ADAM_FN.ellipse.label], ['rosen', ADAM_FN.rosen.label]]), inSelect('lr', '學習率 η', [['0.1', '0.1'], ['0.03', '0.03'], ['0.3', '0.3']]), inNum('steps', '步數', 150, 1, 2000, () => rnd.pick([50, 150, 400]))],
  run({ fn, lr, steps }) {
    const r = new Rec();
    const F = ADAM_FN[fn];
    const eta = Number(lr), b1 = 0.9, b2 = 0.999, eps = 1e-8;
    let th: Pt = [...F.start] as Pt, gd: Pt = [...F.start] as Pt;
    let m: Pt = [0, 0], v: Pt = [0, 0];
    const aPath: Pt[] = [th], gPath: Pt[] = [gd];
    const [x0, x1, y0, y1] = F.bounds;
    const levels = fn === 'ellipse' ? [0.1, 0.4, 1, 2, 3.5] : [0.3, 1, 3, 8, 20];
    const contour: Pt[][] = [];
    if (fn === 'ellipse') levels.forEach((L) => contour.push(Array.from({ length: 73 }, (_, i) => { const t = (i / 72) * 2 * Math.PI; return [Math.sqrt(L / 0.1) * Math.cos(t), Math.sqrt(L / 2) * Math.sin(t)] as Pt; })));
    else levels.forEach((L) => { const pts: Pt[] = []; for (let i = 0; i <= 120; i++) { const x = x0 + ((x1 - x0) * i) / 120; const rem = L - (1 - x) ** 2; if (rem >= 0) pts.push([x, x * x + Math.sqrt(rem / 10)]); } contour.push(pts); const pts2: Pt[] = []; for (let i = 0; i <= 120; i++) { const x = x0 + ((x1 - x0) * i) / 120; const rem = L - (1 - x) ** 2; if (rem >= 0) pts2.push([x, x * x - Math.sqrt(rem / 10)]); } contour.push(pts2); });
    const plot = (): PlotPanel => ({ type: 'plot', axes: true, bounds: F.bounds, curves: [...contour.map((pts) => ({ pts, color: 'muted' as Color, width: 1 })), { pts: [...gPath].filter(([x, y]) => Math.abs(x) < 50 && Math.abs(y) < 50), color: 'active', width: 1.5 }, { pts: [...aPath], color: 'bad', width: 2.5 }], points: [{ x: fn === 'ellipse' ? 0 : 1, y: fn === 'ellipse' ? 0 : 1, r: 6, color: 'special', label: '最小值' }, { x: th[0], y: th[1], r: 5, color: 'bad' }], title: '紅：Adam；藍：一般梯度下降（同 η）', w: 'half' });
    r.snap(`起點 (${F.start.join(', ')})，f = ${f4(F.f(...F.start))}；β₁ = 0.9、β₂ = 0.999、ε = 1e-8`, [plot()], 1);
    for (let t = 1; t <= steps; t++) {
      const g = F.g(th[0], th[1]);
      m = [b1 * m[0] + (1 - b1) * g[0], b1 * m[1] + (1 - b1) * g[1]];
      v = [b2 * v[0] + (1 - b2) * g[0] ** 2, b2 * v[1] + (1 - b2) * g[1] ** 2];
      const mh: Pt = [m[0] / (1 - b1 ** t), m[1] / (1 - b1 ** t)], vh: Pt = [v[0] / (1 - b2 ** t), v[1] / (1 - b2 ** t)];
      const step: Pt = [(eta * mh[0]) / (Math.sqrt(vh[0]) + eps), (eta * mh[1]) / (Math.sqrt(vh[1]) + eps)];
      th = [th[0] - step[0], th[1] - step[1]];
      aPath.push(th);
      const gg = F.g(gd[0], gd[1]);
      gd = [gd[0] - eta * gg[0], gd[1] - eta * gg[1]];
      gPath.push(gd);
      if (t <= 3) r.snap(`第 ${t} 步：g = (${f4(g[0])}, ${f4(g[1])})；m = (${f4(m[0])}, ${f4(m[1])})、v = (${f4(v[0])}, ${f4(v[1])})；修正後 m̂ = (${f4(mh[0])}, ${f4(mh[1])})、v̂ = (${f4(vh[0])}, ${f4(vh[1])})；步伐 (${f4(step[0])}, ${f4(step[1])})${t === 1 ? `——第一步 m̂ = g、v̂ = g²，步伐 ≈ η·sign(g) = ±${eta}` : ''}`, [plot(), table([['m', f4(m[0]), f4(m[1])], ['v', f4(v[0]), f4(v[1])], ['m̂ = m/(1−β₁ᵗ)', f4(mh[0]), f4(mh[1])], ['v̂ = v/(1−β₂ᵗ)', f4(vh[0]), f4(vh[1])], ['η·m̂/(√v̂+ε)', f4(step[0]), f4(step[1])]], {}, { colHeaders: ['', 'x', 'y'], w: 'half' })], t === 1 ? 6 : 7);
      else if (t % Math.max(1, Math.floor(steps / 8)) === 0 || t === steps) r.snap(`第 ${t} 步：Adam f = ${f4(F.f(th[0], th[1]))}、一般梯度下降 f = ${Number.isFinite(F.f(gd[0], gd[1])) ? f4(F.f(gd[0], gd[1])) : '發散'}`, [plot(), vars({ 'Adam θ': `${f3(th[0])}, ${f3(th[1])}`, 'GD θ': `${f3(gd[0])}, ${f3(gd[1])}` })], 7);
    }
    const gf = F.f(gd[0], gd[1]);
    r.snap(`${steps} 步後：Adam 到 (${f3(th[0])}, ${f3(th[1])})、f = ${f4(F.f(th[0], th[1]))}；一般梯度下降 ${Number.isFinite(gf) && gf < 1e6 ? `到 (${f3(gd[0])}, ${f3(gd[1])})、f = ${f4(gf)}` : '發散（陡峭方向的步伐太大）'}`, [plot()], 7);
    return r.frames;
  },
};

// ---------------- 模擬退火 ----------------
const cities = (seed: number, n: number): Pt[] => { const g = parkMiller(seed); return Array.from({ length: n }, () => [+(g.real() * 10).toFixed(2), +(g.real() * 10).toFixed(2)] as Pt); };
const tourLen = (C: Pt[], t: number[]) => t.reduce((s, c, i) => s + Math.hypot(C[c][0] - C[t[(i + 1) % t.length]][0], C[c][1] - C[t[(i + 1) % t.length]][1]), 0);
const bruteTsp = (C: Pt[]) => {
  const n = C.length, rest = Array.from({ length: n - 1 }, (_, i) => i + 1);
  let best = Infinity, bt: number[] = [];
  const perm = (a: number[], k: number) => { if (k === a.length) { const t = [0, ...a]; const L = tourLen(C, t); if (L < best - 1e-12) { best = L; bt = t; } return; } for (let i = k; i < a.length; i++) { [a[k], a[i]] = [a[i], a[k]]; perm(a, k + 1); [a[k], a[i]] = [a[i], a[k]]; } };
  perm(rest, 0);
  return { best, bt };
};
const annealing: AlgoDef = {
  id: 'simulated-annealing', name: '模擬退火', en: 'Simulated Annealing (TSP)', cat,
  desc: '借用金屬退火的概念求解旅行推銷員問題。每次隨機產生一個鄰近解（2-opt：把路線中一段反轉），若變短就接受；若變長 Δ，仍以機率 e^(−Δ/T) 接受——溫度 T 高時常接受壞解、能跳出局部最優，T 逐步降低（每步乘以冷卻率）後就只往下走。它是啟發式方法：有限步數內不保證找到全域最優。8 個城市時可以用暴力法求真正的最優解來比較差距。使用固定種子。',
  time: 'O(步數)', space: 'O(n)',
  code: ['tour = 隨機路線，T = T₀', 'repeat 步數 次:', '  隨機選 i < j，新路線 = 把 tour[i..j] 反轉（2-opt）', '  Δ = 新長度 − 舊長度', '  if Δ < 0 或 random() < e^(−Δ/T): 接受新路線', '  記錄目前最短的路線；T ← T × 冷卻率', '不保證有限步內找到全域最優'],
  inputs: [inNum('steps', '步數', 2000, 10, 50000, () => rnd.pick([300, 2000, 8000])), inSelect('cool', '冷卻率', [['0.997', '0.997'], ['0.99', '0.99（快速冷卻）'], ['0.9995', '0.9995（慢）']]), seedIn(7)],
  run({ steps, cool, seed }) {
    const r = new Rec();
    const C = cities(21, 8);
    const g = parkMiller(seed);
    const n = C.length;
    let tour = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = g.int(i + 1); [tour[i], tour[j]] = [tour[j], tour[i]]; }
    let len = tourLen(C, tour), best = [...tour], bestLen = len, T = 2;
    const cr = Number(cool);
    const curve: Pt[] = [[0, len]], bcurve: Pt[] = [[0, len]];
    const plot = (t: number[], title: string, color: Color = 'active'): PlotPanel => ({ type: 'plot', square: true, axes: true, bounds: [-0.5, 10.5, -0.5, 10.5], polygons: [{ pts: t.map((c) => C[c]), color }], points: C.map(([x, y], i) => ({ x, y, r: 5, label: String(i), color: 'muted' as Color })), title, w: 'half' });
    r.snap(`8 個城市，隨機初始路線長度 ${f3(len)}；T₀ = 2、冷卻率 ${cr}`, [plot(tour, '目前路線'), lossPlot([{ pts: curve, color: 'active' }], '路線長度', 'half')], 1);
    let acceptedWorse = 0;
    const every = Math.max(1, Math.floor(steps / 10));
    for (let s = 1; s <= steps; s++) {
      let i = g.int(n), j = g.int(n);
      if (i > j) [i, j] = [j, i];
      if (i === j) { T *= cr; continue; }
      const nt = [...tour.slice(0, i), ...tour.slice(i, j + 1).reverse(), ...tour.slice(j + 1)];
      const nl = tourLen(C, nt), raw = nl - len, d = Math.abs(raw) < 1e-9 ? 0 : raw;
      if (d < 0 || g.real() < Math.exp(-d / T)) { if (d > 0) acceptedWorse++; tour = nt; len = nl; if (len < bestLen - 1e-12) { bestLen = len; best = [...tour]; } }
      T *= cr;
      if (s % Math.max(1, Math.floor(steps / 200)) === 0) { curve.push([s, len]); bcurve.push([s, bestLen]); }
      if (s % every === 0) r.snap(`第 ${s} 步：T = ${T.toExponential(2)}，目前長度 ${f3(len)}、最短 ${f3(bestLen)}，累計接受了 ${acceptedWorse} 次變長的解`, [plot(tour, '目前路線'), lossPlot([{ pts: [...curve], color: 'active' }, { pts: [...bcurve], color: 'done' }], '藍：目前；綠：最短', 'half')], 6);
    }
    const opt = bruteTsp(C);
    const gap = ((bestLen - opt.best) / opt.best) * 100;
    r.snap(`退火結果 ${f3(bestLen)}；暴力法求得的最優 ${f3(opt.best)}，差距 ${f3(gap)}%${gap < 1e-6 ? '（這次找到了最優解，但不保證每次都能）' : '——有限步數內不保證最優，可加長步數或放慢冷卻'}`, [plot(best, '退火最佳路線', 'done'), plot(opt.bt, '暴力法最優路線', 'special')], 7);
    return r.frames;
  },
};

// ---------------- 遺傳演算法 ----------------
const KS_ITEMS: [number, number][] = [[12, 4], [2, 2], [1, 1], [4, 10], [1, 2], [6, 7], [3, 5], [5, 8], [9, 9], [7, 6], [8, 11], [2, 3]];
const KS_CAP = 25;
const genetic: AlgoDef = {
  id: 'genetic-algorithm', name: '遺傳演算法', en: 'Genetic Algorithm (0/1 Knapsack)', cat,
  desc: '模仿演化：一群候選解（染色體，這裡是 0/1 字串，代表背包中放哪些物品）經過選擇、交配、突變一代代改良。錦標賽選擇挑出較好的父母，單點交配交換兩段基因，每個位元以小機率翻轉。超重的解用「修復」保持可行：依價值重量比由差到好逐一拿掉物品直到不超重。每代保留最好的個體（菁英保留）。它是啟發式方法，不保證得到最佳解；這裡與動態規劃求得的最佳值比較。',
  time: 'O(代數 · 族群數 · n)', space: 'O(族群數 · n)',
  code: ['族群 = 隨機 0/1 字串；超重者修復（拿掉價值重量比最差的物品）', 'for 每一代:', '  保留最好的個體（菁英）', '  重複：錦標賽各選出父、母（隨機取 3 個中最好的）', '    單點交配 → 子代；每個位元以機率 p 翻轉（突變）', '    修復子代使其不超重', '不保證最佳；與動態規劃的最佳值比較'],
  inputs: [inNum('gens', '代數', 30, 1, 500, () => rnd.pick([10, 30, 80])), inSelect('pm', '突變率', [['0.05', '0.05'], ['0.01', '0.01'], ['0.2', '0.2']]), seedIn(4)],
  run({ gens, pm, seed }) {
    const r = new Rec();
    const g = parkMiller(seed);
    const n = KS_ITEMS.length, POP = 16, pmut = Number(pm);
    const wsum = (c: number[]) => c.reduce((s, b, i) => s + b * KS_ITEMS[i][0], 0), vsum = (c: number[]) => c.reduce((s, b, i) => s + b * KS_ITEMS[i][1], 0);
    const byRatio = KS_ITEMS.map((_, i) => i).sort((a, b) => KS_ITEMS[a][1] / KS_ITEMS[a][0] - KS_ITEMS[b][1] / KS_ITEMS[b][0] || a - b);
    const repair = (c: number[]) => { for (const i of byRatio) { if (wsum(c) <= KS_CAP) break; c[i] = 0; } return c; };
    let pop = Array.from({ length: POP }, () => repair(Array.from({ length: n }, () => (g.int(2)))));
    const dp = new Array(KS_CAP + 1).fill(0);
    for (const [w, v] of KS_ITEMS) for (let c = KS_CAP; c >= w; c--) dp[c] = Math.max(dp[c], dp[c - w] + v);
    const optimum = dp[KS_CAP];
    const bestOf = (P: number[][]) => P.reduce((a, b) => (vsum(b) > vsum(a) ? b : a));
    const bestCurve: Pt[] = [], avgCurve: Pt[] = [];
    const record = (gen: number) => { bestCurve.push([gen, vsum(bestOf(pop))]); avgCurve.push([gen, pop.reduce((s, c) => s + vsum(c), 0) / POP]); };
    const popTable = () => table([...pop].sort((a, b) => vsum(b) - vsum(a)).slice(0, 8).map((c) => [c.join(''), wsum(c), vsum(c)]), { '0,2': 'done' }, { title: '族群前 8 名（染色體、重量、價值）', colHeaders: ['染色體', '重量', '價值'], w: 'half' });
    record(0);
    r.snap(`${n} 個物品（重量, 價值），容量 ${KS_CAP}；初始族群 ${POP} 個，已修復成不超重。初始最佳價值 ${vsum(bestOf(pop))}`, [table(KS_ITEMS.map(([w, v], i) => [i, w, v, f3(v / w)]), {}, { colHeaders: ['物品', '重量', '價值', '價值/重量'], w: 'half' }), popTable()], 1);
    const tour = () => { let b = pop[g.int(POP)]; for (let k = 0; k < 2; k++) { const c = pop[g.int(POP)]; if (vsum(c) > vsum(b)) b = c; } return b; };
    for (let gen = 1; gen <= gens; gen++) {
      const next = [[...bestOf(pop)]];
      while (next.length < POP) {
        const a = tour(), b = tour();
        const cut = 1 + g.int(n - 1);
        const child = [...a.slice(0, cut), ...b.slice(cut)].map((bit) => (g.real() < pmut ? 1 - bit : bit));
        next.push(repair(child));
      }
      pop = next;
      record(gen);
      if (gen <= 2 || gen % Math.max(1, Math.floor(gens / 8)) === 0 || gen === gens) r.snap(`第 ${gen} 代：最佳價值 ${vsum(bestOf(pop))}、平均 ${f3(avgCurve[avgCurve.length - 1][1])}（動態規劃最佳 ${optimum}）`, [lossPlot([{ pts: [...bestCurve], color: 'done' }, { pts: [...avgCurve], color: 'active' }], '綠：最佳；藍：平均', 'half'), popTable()], 5);
    }
    const best = bestOf(pop);
    r.snap(`${gens} 代後最佳：${best.join('')}（重量 ${wsum(best)} ≤ ${KS_CAP}，價值 ${vsum(best)}）；動態規劃的最佳值 ${optimum}${vsum(best) === optimum ? '，這次達到最佳，但遺傳演算法不保證每次都能' : `，差 ${optimum - vsum(best)}`}`, [lossPlot([{ pts: bestCurve, color: 'done' }, { pts: avgCurve, color: 'active' }], '綠：最佳；藍：平均', 'half'), popTable()], 7);
    return r.frames;
  },
};

// ---------------- 別名抽樣 ----------------
const aliasMethod: AlgoDef = {
  id: 'alias-method', name: '別名抽樣法', en: "Alias Method (Vose's)", cat,
  desc: '要從 n 個帶權重的選項中反覆抽樣，逐一累加權重每次要 O(n) 或 O(log n)；別名法先花 O(n) 建表，之後每次抽樣只要 O(1)：把每個機率乘以 n，想像成 n 根柱子，高於 1 的柱子把多出來的部分切去補滿不足 1 的柱子，使每一欄最多由兩個選項組成（本身與一個「別名」）。抽樣時隨機選一欄，再擲一次硬幣決定取本身或別名。權重必須非負且總和大於 0。最後抽 10000 次，比較頻率與理論機率。',
  time: '建表 O(n)，每次抽樣 O(1)', space: 'O(n)',
  code: ['p_i = w_i / Σw × n', 'small = {i : p_i < 1}，large = {i : p_i ≥ 1}', 'while small 與 large 都不空:', '  s = small.pop()，l = large.pop()', '  prob[s] = p_s，alias[s] = l；p_l −= (1 − p_s)', '  依 p_l 放回 small 或 large', '剩下的 prob = 1；抽樣：i = 隨機欄，coin < prob[i] ? i : alias[i]'],
  inputs: [inText('w', '權重（非負）', '5 1 3 1 8 2', () => rnd.arr(rnd.int(3, 7), 0, 9).join(' ')), seedIn(7)],
  run({ w, seed }) {
    const r = new Rec();
    const W = String(w).split(/[\s,]+/).filter(Boolean).map(Number);
    if (!W.length || W.some((x) => !Number.isFinite(x))) throw new Error('權重必須是數字');
    if (W.some((x) => x < 0)) throw new Error('權重不可為負數');
    const total = W.reduce((a, b) => a + b, 0);
    if (total <= 0) throw new Error('權重總和必須大於 0');
    const n = W.length;
    const p = W.map((x) => (x / total) * n);
    const prob = new Array(n).fill(0), alias = new Array(n).fill(-1);
    const small: number[] = [], large: number[] = [];
    p.forEach((v, i) => (v < 1 ? small : large).push(i));
    const cols = () => table([p.map((v) => f3(v)), prob.map((v, i) => (alias[i] >= 0 || prob[i] === 1 ? f3(v) : '')), alias.map((a) => (a >= 0 ? a : ''))], {}, { title: '每一欄（下排為別名）', rowHeaders: ['剩餘 p', 'prob', 'alias'], colHeaders: W.map((_, i) => i) });
    const barView = (hl: number[] = []) => bars(p.map((v) => +Math.max(0, v).toFixed(3)), Object.fromEntries(p.map((v, i) => [i, hl.includes(i) ? 'swap' : v < 1 ? 'frontier' : 'active'])), { title: '縮放後機率 p·n（青：< 1；藍：≥ 1）', w: 'half' });
    r.snap(`權重 ${W.join(' ')}，總和 ${total}；乘以 n = ${n} 後 small = {${small.join(',')}}、large = {${large.join(',')}}`, [barView(), cols()], 2);
    while (small.length && large.length) {
      const s = small.pop()!, l = large.pop()!;
      prob[s] = p[s]; alias[s] = l;
      const before = p[l];
      p[l] -= 1 - p[s];
      (p[l] < 1 ? small : large).push(l);
      r.snap(`第 ${s} 欄高度 ${f3(prob[s])}，用選項 ${l} 補滿剩下的 ${f3(1 - prob[s])}：alias[${s}] = ${l}，p[${l}] = ${f3(before)} − ${f3(1 - prob[s])} = ${f3(p[l])}`, [barView([s, l]), cols()], 5);
    }
    for (const i of [...small, ...large]) { prob[i] = 1; alias[i] = i; }
    r.snap('剩下的欄位高度都是 1（浮點誤差也在此吸收），建表完成', [barView(), cols()], 7);
    const g = parkMiller(seed);
    const N = 10000, cnt = new Array(n).fill(0);
    for (let k = 0; k < N; k++) { const i = g.int(n); cnt[g.real() < prob[i] ? i : alias[i]]++; }
    const expect = W.map((x) => (x / total) * N);
    const chi = cnt.reduce((s, c, i) => s + (expect[i] > 0 ? (c - expect[i]) ** 2 / expect[i] : 0), 0);
    const df = W.filter((x) => x > 0).length - 1;
    const crit = [NaN, 3.84, 5.99, 7.81, 9.49, 11.07, 12.59, 14.07, 15.51, 16.92, 18.31][Math.min(10, df)];
    r.snap(`抽樣 ${N} 次（每次 O(1)）：卡方統計量 ${f3(chi)}，自由度 ${df} 的 95% 臨界值 ${df >= 1 ? crit : '—'} → ${df < 1 ? '只有一個可能的結果' : chi <= crit ? '不拒絕「頻率符合理論機率」' : '在 95% 水準下拒絕（約 5% 的種子會偶然如此，可換個種子比較）'}${W.some((x) => x === 0) ? `；權重為 0 的選項出現 ${W.map((x, i) => (x === 0 ? cnt[i] : 0)).reduce((a, b) => a + b, 0)} 次` : ''}`, [bars(cnt, {}, { title: '實際次數', labels: cnt.map((c, i) => `${i}:${c}`), w: 'half' }), bars(expect.map((e) => Math.round(e)), {}, { title: '理論期望', labels: expect.map((e, i) => `${i}:${Math.round(e)}`), w: 'half' })], 7);
    return r.frames;
  },
};

export default [linearRegression, logistic, naiveBayes, decisionTree, dbscan, agglomerative, pca, backprop, sgd, adam, annealing, genetic, aliasMethod];
