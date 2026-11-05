import type { AlgoDef, Color, GEdge, GNode, PlotPanel } from '../core/types';
import { Rec, cells, vars, table, text, inText, inNum, inSelect, inSeed, seeded, rnd, bars } from '../core/helpers';
import { gpanel, graphInput, layoutTree, parseGraph } from '../core/graph';

const cat = 'other';
type CM = Record<string, Color | undefined>;

// ---------------- 壓縮 ----------------

const rle: AlgoDef = {
  id: 'rle', name: '游程編碼', en: 'Run-Length Encoding', cat,
  desc: '把連續重複的字元壓成「次數 + 字元」。對長串重複的資料（如簡單圖形、傳真）效果很好，但對沒有重複的資料反而會變長。',
  time: 'O(n)', space: 'O(n)',
  code: ['i = 0', 'while i < n:', '  j = i', '  while j < n and s[j] == s[i]: j++', '  output (j - i, s[i])', '  i = j'],
  inputs: [inText('s', '字串', 'WWWWWWWWWWWWBWWWWWWWWWWWWBBBWWWWWWWWWWWWWWWWWWWWWWWWBWWWWWWWWWWWWWW', () => rnd.pick(['AAABBBCCCCCDDDDDDE', 'ABCDEF', 'aaaaaaaaaabbbbbcc']))],
  run({ s }) {
    const r = new Rec();
    const out: string[] = [];
    let i = 0;
    const PAL: Color[] = ['active', 'path', 'visited', 'good', 'special', 'frontier'];
    const col: Record<number, Color> = {};
    while (i < s.length) {
      let j = i;
      while (j < s.length && s[j] === s[i]) j++;
      out.push(`${j - i}${s[i]}`);
      for (let k = i; k < j; k++) col[k] = PAL[(out.length - 1) % PAL.length];
      r.snap(`'${s[i]}' 連續出現 ${j - i} 次 → ${j - i}${s[i]}`, [cells(s.split(''), { ...col }, { title: '輸入', headers: false }), cells(out, Object.fromEntries(out.map((_, k) => [k, PAL[k % PAL.length]])), { title: '輸出', headers: false })], 5);
      i = j;
    }
    const enc = out.join('');
    r.snap(`編碼：${enc}（${s.length} → ${enc.length} 字元，壓縮率 ${((enc.length / s.length) * 100).toFixed(1)}%）`, [cells(s.split(''), col, { title: '輸入', headers: false }), text([enc], '編碼結果')]);
    return r.frames;
  },
};

const lz77: AlgoDef = {
  id: 'lz77', name: 'LZ77 滑動視窗壓縮', en: 'LZ77 (Sliding Window)', cat,
  desc: '維護一個「搜尋緩衝區」（最近處理過的字元）與「前視緩衝區」。每一步在搜尋緩衝區中找與前視緩衝區開頭最長的匹配，輸出 (往回距離, 長度, 下一個字元)。gzip／PNG 的 DEFLATE 以它為基礎。',
  time: 'O(n · W)', space: 'O(W)',
  code: ['i = 0', 'while i < n:', '  在 [i-W, i) 中找與 s[i..] 最長的匹配 (offset, len)', '  output (offset, len, s[i+len])', '  i = i + len + 1'],
  inputs: [inText('s', '字串', 'abracadabrarray', () => rnd.pick(['aacaacabcabaaac', 'abababababc', 'to be or not to be'])), inNum('W', '搜尋視窗大小', 8, 1, 50)],
  run({ s, W }) {
    const r = new Rec();
    const out: string[] = [];
    let i = 0;
    while (i < s.length) {
      let bo = 0, bl = 0;
      for (let st = Math.max(0, i - W); st < i; st++) {
        let l = 0;
        while (i + l < s.length - 1 && s[st + l] === s[i + l]) l++;
        if (l > bl) { bl = l; bo = i - st; }
      }
      const nxt = s[i + bl] ?? '';
      const c: Record<number, Color> = {};
      for (let k = Math.max(0, i - W); k < i; k++) c[k] = 'frontier';
      for (let k = 0; k < bl; k++) { c[i - bo + k] = 'compare'; c[i + k] = 'active'; }
      if (i + bl < s.length) c[i + bl] = 'swap';
      out.push(`(${bo},${bl},${nxt === ' ' ? '␣' : nxt})`);
      r.snap(bl ? `在往回 ${bo} 處找到長度 ${bl} 的匹配，輸出 (${bo}, ${bl}, '${nxt}')` : `沒有匹配，輸出 (0, 0, '${nxt}')`, [cells(s.split(''), c, { title: '青：搜尋視窗　黃：匹配來源　藍：目前位置　紅：下一個字元' }), cells(out, {}, { title: '輸出三元組', headers: false })], 4);
      i += bl + 1;
    }
    r.snap(`${s.length} 個字元編碼成 ${out.length} 個三元組`, [cells(s.split(''), {}), text([out.join(' ')], '輸出')]);
    return r.frames;
  },
};

const lz78: AlgoDef = {
  id: 'lz78', name: 'LZ78 字典壓縮', en: 'LZ78 (Dictionary)', cat,
  desc: '動態建立字典：從目前位置讀取字典中已存在的最長片語 w，再多讀一個字元 c，輸出 (w 的字典索引, c)，並把 w+c 加入字典。',
  time: 'O(n)', space: 'O(n)',
  code: ['dict = {"": 0}', 'w = ""', 'for c in s:', '  if w + c in dict: w = w + c', '  else:', '    output (dict[w], c)', '    dict[w + c] = 新索引; w = ""', '結尾若 w 非空輸出 (dict[w], -)'],
  inputs: [inText('s', '字串', 'ABBCBCABABCAABCAAB', () => rnd.pick(['aabaacabaaab', 'abababababab', 'mississippi']))],
  run({ s }) {
    const r = new Rec();
    const dict = new Map<string, number>([['', 0]]);
    const out: string[] = [];
    let w = '', start = 0;
    const P = (i: number, hl = -1) => [cells(s.split(''), Object.fromEntries(Array.from({ length: i - start + 1 }, (_, k) => [start + k, 'active' as Color])), { title: '輸入' }), table([...dict.entries()].map(([k, v]) => [v, k || 'ε']), { [`${hl},0`]: 'swap', [`${hl},1`]: 'swap' }, { colHeaders: ['索引', '片語'], w: 'half', title: '字典' }), cells(out.length ? out : [''], {}, { title: '輸出', headers: false, w: 'half' })];
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (dict.has(w + c)) { w += c; r.snap(`"${w}" 已在字典中，繼續延伸`, P(i), 4); }
      else {
        out.push(`(${dict.get(w)},${c})`);
        dict.set(w + c, dict.size);
        r.snap(`"${w + c}" 不在字典：輸出 (${dict.get(w)}, '${c}')，加入字典索引 ${dict.size - 1}`, P(i, dict.size - 1), 7);
        w = ''; start = i + 1;
      }
    }
    if (w) { out.push(`(${dict.get(w)},-)`); r.snap(`結尾剩下 "${w}"，輸出 (${dict.get(w)}, -)`, P(s.length - 1), 8); }
    r.snap(`輸出 ${out.length} 組：${out.join(' ')}`, P(-1));
    return r.frames;
  },
};

const lzw: AlgoDef = {
  id: 'lzw', name: 'LZW 字典壓縮', en: 'Lempel–Ziv–Welch', cat,
  desc: 'LZ78 的改良：字典預先放入所有單一字元，輸出只需索引（不需附帶字元）。讀到 w + c 不在字典時輸出 w 的索引，並把 w + c 加入字典，從 c 重新開始。GIF 與早期 Unix compress 使用此演算法。',
  time: 'O(n)', space: 'O(n)',
  code: ['dict = 所有單一字元', 'w = ""', 'for c in s:', '  if w + c in dict: w = w + c', '  else:', '    output dict[w]', '    dict[w + c] = 新索引', '    w = c', 'output dict[w]'],
  inputs: [inText('s', '字串', 'TOBEORNOTTOBEORTOBEORNOT', () => rnd.pick(['ABABABA', 'BABAABAAA', 'WYS*WYGWYS*WYSWYSG']))],
  run({ s }) {
    const r = new Rec();
    const chars: string[] = [...new Set<string>(String(s).split(''))].sort();
    const dict = new Map<string, number>(chars.map((c, i) => [c, i]));
    const out: number[] = [];
    let w = '', start = 0;
    const P = (i: number, hl = -1) => [cells(s.split(''), Object.fromEntries(Array.from({ length: Math.max(0, i - start + 1) }, (_, k) => [start + k, 'active' as Color])), { title: '輸入' }), table([...dict.entries()].map(([k, v]) => [v, k]), { [`${hl},0`]: 'swap', [`${hl},1`]: 'swap' }, { colHeaders: ['碼', '字串'], w: 'half', title: '字典' }), cells(out.length ? out : [''], {}, { title: '輸出碼', headers: false, w: 'half' })];
    r.snap(`字典初始化為 ${chars.length} 個單一字元`, P(-1), 1);
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (dict.has(w + c)) { w += c; r.snap(`"${w}" 在字典中，延伸`, P(i), 4); }
      else {
        out.push(dict.get(w)!);
        dict.set(w + c, dict.size);
        r.snap(`"${w + c}" 不在字典：輸出 "${w}" 的碼 ${dict.get(w)}，新增 "${w + c}" = ${dict.size - 1}`, P(i, dict.size - 1), 7);
        w = c; start = i;
      }
    }
    out.push(dict.get(w)!);
    r.snap(`輸出最後的 "${w}" = ${dict.get(w)}。${s.length} 個字元 → ${out.length} 個碼`, P(s.length - 1), 9);
    return r.frames;
  },
};

const arith: AlgoDef = {
  id: 'arithmetic-coding', name: '算術編碼', en: 'Arithmetic Coding', cat,
  desc: '把整段訊息編碼成 [0, 1) 中的一個區間：依每個符號的機率把目前區間切成子區間，選取對應符號的那一段，逐步縮小。最後區間內任一數字即代表整段訊息，可逼近熵的極限。',
  time: 'O(n)', space: 'O(σ)',
  code: ['low = 0, high = 1', 'for c in 訊息:', '  range = high - low', '  high = low + range · cumHigh(c)', '  low  = low + range · cumLow(c)', '輸出 [low, high) 中任一數（如中點）'],
  inputs: [inText('s', '訊息（短一點，避免浮點誤差）', 'BACAB', () => rnd.pick(['ABBA', 'CAB', 'AABAC', 'BBBA']))],
  run({ s }) {
    const r = new Rec();
    const freq: Record<string, number> = {};
    for (const c of s) freq[c] = (freq[c] ?? 0) + 1;
    const syms = Object.keys(freq).sort();
    const cum: Record<string, [number, number]> = {};
    let acc = 0;
    for (const c of syms) { cum[c] = [acc, acc + freq[c] / s.length]; acc += freq[c] / s.length; }
    let lo = 0, hi = 1;
    const PAL: Color[] = ['active', 'path', 'visited', 'good', 'special', 'frontier'];
    const levels: PlotPanel['segments'] = [];
    const labels: NonNullable<PlotPanel['points']> = [];
    const draw = (row: number, L: number, H: number, chosen?: string) => {
      for (const [k, c] of syms.entries()) {
        const a = L + (H - L) * cum[c][0], b = L + (H - L) * cum[c][1];
        levels!.push({ x1: (a - L) / (H - L), y1: -row, x2: (b - L) / (H - L), y2: -row, color: c === chosen ? 'bad' : PAL[k % PAL.length], width: c === chosen ? 16 : 10 });
        labels.push({ x: ((a + b) / 2 - L) / (H - L), y: -row + 0.3, label: c, r: 0.01 });
      }
      labels.push({ x: 0, y: -row - 0.35, label: L.toFixed(6), r: 0.01 }, { x: 0.85, y: -row - 0.35, label: H.toFixed(6), r: 0.01 });
    };
    const P = () => [{ type: 'plot' as const, bounds: [-0.02, 1.02, -s.length - 1, 1] as [number, number, number, number], height: 60 + 50 * s.length, segments: [...levels!], points: [...labels], title: '每一列把上一列選中的區間（紅色）放大' }, table(syms.map((c) => [c, `${freq[c]}/${s.length}`, `[${cum[c][0].toFixed(3)}, ${cum[c][1].toFixed(3)})`]), {}, { colHeaders: ['符號', '機率', '累積區間'], w: 'half' }), vars({ low: lo.toFixed(8), high: hi.toFixed(8) })];
    draw(0, 0, 1);
    r.snap('依頻率把 [0, 1) 分給各符號', P(), 1);
    levels!.length = 0; labels.length = 0;
    for (const [i, c] of [...s].entries()) {
      draw(i, lo, hi, c);
      const rg = hi - lo;
      hi = lo + rg * cum[c][1];
      lo = lo + rg * cum[c][0];
      r.snap(`第 ${i + 1} 個符號 '${c}'：區間縮小為 [${lo.toFixed(6)}, ${hi.toFixed(6)})`, P(), 4);
    }
    const bitsNeeded = Math.ceil(-Math.log2(hi - lo)) + 1;
    r.snap(`編碼值可取 ${((lo + hi) / 2).toFixed(8)}，約需 ${bitsNeeded} bits（固定長度需 ${s.length * Math.max(1, Math.ceil(Math.log2(syms.length)))} bits）`, P(), 6);
    return r.frames;
  },
};

// ---------------- 博弈樹 ----------------

interface GT { id: string; kids: GT[]; val?: number; leaf?: number }
function buildGame(b: number, leaves: number[]) {
  const depth = Math.max(1, Math.round(Math.log(leaves.length) / Math.log(b)));
  let k = 0, id = 0;
  const mk = (d: number): GT => (d === depth ? { id: 'g' + id++, kids: [], leaf: leaves[k++] ?? 0 } : { id: 'g' + id++, kids: Array.from({ length: b }, () => mk(d + 1)) });
  const root = mk(0);
  const children: Record<string, string[]> = {};
  const walk = (n: GT) => { children[n.id] = n.kids.map((c) => c.id); n.kids.forEach(walk); };
  walk(root);
  const pos = layoutTree(root.id, children, 40, 70);
  return { root, pos, depth };
}
const gameIn = () => [inNum('b', '分支數', 2, 2, 3), inText('leaves', '葉節點分數（數量需為 分支數^深度）', '3 5 6 9 1 2 0 -1 8 4 7 2 5 1 3 6', () => rnd.arr(rnd.pick([8, 16]), -5, 15).join(' '))];

function gamePanel(G: ReturnType<typeof buildGame>, st: Record<string, Color | undefined>, sub: Record<string, string>, best?: Set<string>) {
  const nodes: GNode[] = [], edges: GEdge[] = [];
  const walk = (n: GT, d: number) => {
    nodes.push({ id: n.id, x: G.pos[n.id].x, y: G.pos[n.id].y, label: n.leaf !== undefined ? String(n.leaf) : n.val !== undefined ? String(n.val) : d % 2 ? 'min' : 'MAX', color: st[n.id], sub: sub[n.id], shape: d % 2 ? 'circle' : 'rect', w: 36, h: 28, r: 16 });
    for (const c of n.kids) { edges.push({ from: n.id, to: c.id, color: best?.has(c.id) ? 'path' : st[c.id] === 'muted' ? 'muted' : undefined, width: best?.has(c.id) ? 4 : undefined }); walk(c, d + 1); }
  };
  walk(G.root, 0);
  return { type: 'graph' as const, nodes, edges, title: '方形 = MAX 層，圓形 = min 層' };
}

const minimax: AlgoDef = {
  id: 'minimax', name: '極小化極大搜尋', en: 'Minimax', cat,
  desc: '雙人零和遊戲的決策：MAX 層選子節點中的最大值、min 層選最小值，由葉節點往上倒推，得到在對手也採最佳策略下的最佳分數與走法。',
  time: 'O(b^d)', space: 'O(d)',
  code: ['minimax(node, isMax):', '  if node 是葉節點: return 分數', '  if isMax:', '    return max(minimax(c, false) for c in children)', '  else:', '    return min(minimax(c, true) for c in children)'],
  inputs: gameIn(),
  run({ b, leaves }) {
    const r = new Rec();
    const G = buildGame(b, String(leaves).trim().split(/\s+/).map(Number));
    const st: Record<string, Color> = {}, sub: Record<string, string> = {};
    let count = 0;
    const mm = (n: GT, d: number): number => {
      st[n.id] = 'active';
      if (n.leaf !== undefined) { count++; st[n.id] = 'visited'; r.snap(`葉節點 ${n.leaf}`, [gamePanel(G, st, sub), vars({ 評估葉節點: count })], 2); return n.leaf; }
      r.snap(`進入${d % 2 ? ' min' : ' MAX'} 節點`, [gamePanel(G, st, sub), vars({ 評估葉節點: count })], d % 2 ? 5 : 3);
      const vals = n.kids.map((c) => mm(c, d + 1));
      n.val = d % 2 ? Math.min(...vals) : Math.max(...vals);
      st[n.id] = 'done';
      r.snap(`${d % 2 ? 'min' : 'MAX'}(${vals.join(', ')}) = ${n.val}`, [gamePanel(G, st, sub), vars({ 評估葉節點: count })], d % 2 ? 6 : 4);
      return n.val;
    };
    const v = mm(G.root, 0);
    const best = new Set<string>();
    for (let n: GT | undefined = G.root; n && n.kids.length; ) { const c: GT | undefined = n.kids.find((k) => (k.val ?? k.leaf) === n!.val); if (c) best.add(c.id); n = c; }
    r.snap(`根節點的值 = ${v}；橘色為雙方最佳策略下的對局路線（共評估 ${count} 個葉節點）`, [gamePanel(G, st, sub, best), vars({ 評估葉節點: count })]);
    return r.frames;
  },
};

const alphabeta: AlgoDef = {
  id: 'alpha-beta', name: 'α–β 剪枝', en: 'Alpha–Beta Pruning', cat,
  desc: '在 Minimax 中維護 α（MAX 已保證的下界）與 β（min 已保證的上界）。當 α ≥ β 時，剩下的子節點不可能影響結果，直接剪掉（灰色）。結果與 Minimax 相同，但評估的節點更少；子節點排序越好，剪得越多。',
  time: '最佳 O(b^(d/2))', space: 'O(d)',
  code: ['ab(node, α, β, isMax):', '  if 葉節點: return 分數', '  for c in children:', '    v = ab(c, α, β, !isMax)', '    MAX: α = max(α, v)；min: β = min(β, v)', '    if α >= β: break  (剪枝)', '  return MAX ? α : β'],
  inputs: gameIn(),
  run({ b, leaves }) {
    const r = new Rec();
    const G = buildGame(b, String(leaves).trim().split(/\s+/).map(Number));
    const st: Record<string, Color> = {}, sub: Record<string, string> = {};
    let count = 0;
    const prune = (n: GT) => { st[n.id] = 'muted'; n.kids.forEach(prune); };
    const ab = (n: GT, a: number, bt: number, d: number): number => {
      st[n.id] = 'active';
      sub[n.id] = `α${fmtInf(a)} β${fmtInf(bt)}`;
      if (n.leaf !== undefined) { count++; st[n.id] = 'visited'; r.snap(`葉節點 ${n.leaf}`, [gamePanel(G, st, sub), vars({ 評估葉節點: count })], 2); return n.leaf; }
      r.snap(`進入節點，α = ${fmtInf(a)}，β = ${fmtInf(bt)}`, [gamePanel(G, st, sub), vars({ 評估葉節點: count })], 3);
      let v = d % 2 ? Infinity : -Infinity;
      for (let i = 0; i < n.kids.length; i++) {
        const cv = ab(n.kids[i], a, bt, d + 1);
        if (d % 2) { v = Math.min(v, cv); bt = Math.min(bt, v); } else { v = Math.max(v, cv); a = Math.max(a, v); }
        sub[n.id] = `α${fmtInf(a)} β${fmtInf(bt)}`;
        st[n.id] = 'active';
        r.snap(`更新：α = ${fmtInf(a)}，β = ${fmtInf(bt)}`, [gamePanel(G, st, sub), vars({ 評估葉節點: count })], 5);
        if (a >= bt && i < n.kids.length - 1) {
          for (const c of n.kids.slice(i + 1)) prune(c);
          r.snap(`α ≥ β → 剪掉其餘 ${n.kids.length - i - 1} 個子樹`, [gamePanel(G, st, sub), vars({ 評估葉節點: count })], 6);
          break;
        }
      }
      n.val = v;
      st[n.id] = 'done';
      return v;
    };
    const v = ab(G.root, -Infinity, Infinity, 0);
    const total = b ** G.depth;
    r.snap(`根節點的值 = ${v}；只評估 ${count}/${total} 個葉節點`, [gamePanel(G, st, sub), vars({ 評估葉節點: count, 全部葉節點: total })], 7);
    return r.frames;
  },
};
const fmtInf = (x: number) => (x === Infinity ? '∞' : x === -Infinity ? '-∞' : String(x));

const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const winner = (b: string[]) => { for (const [a, c, d] of LINES) if (b[a] !== '.' && b[a] === b[c] && b[a] === b[d]) return b[a]; return b.includes('.') ? null : 'draw'; };

const mcts: AlgoDef = {
  id: 'mcts', name: '蒙地卡羅樹搜尋', en: 'Monte Carlo Tree Search (UCT)', cat,
  desc: '以井字棋為例。每次迭代四步：選擇（依 UCB1 = 勝率 + c·√(ln N / n) 往下走）、擴展（加入一個新子節點）、模擬（隨機下到終局）、反向傳播（沿路更新勝場與次數）。迭代越多，走訪次數最多的子節點就是最佳走法。',
  time: 'O(迭代數 × 深度)', space: 'O(樹的大小)',
  code: ['repeat N 次:', '  選擇：從根依 UCB1 走到未完全展開的節點', '  擴展：加入一個未嘗試過的走法', '  模擬：隨機下到終局', '  反向傳播：沿路徑更新 wins / visits', '選擇走訪次數最多的子節點'],
  inputs: [inText('board', '盤面（9 格，X/O/.，由左上到右下）', 'X.O.X....', () => rnd.pick(['X.O.X....', '.........', 'XO.OX....', 'X...O..X.'])), inNum('iters', '迭代次數', 300, 10, 3000), inSeed()],
  run({ board, iters, seed }) {
    const r = new Rec();
    const rand = seeded(seed);
    const B0 = String(board).padEnd(9, '.').slice(0, 9).split('');
    const xs = B0.filter((c) => c === 'X').length, os = B0.filter((c) => c === 'O').length;
    const me = xs > os ? 'O' : 'X';
    interface N { id: string; move: number; player: string; board: string[]; kids: N[]; untried: number[]; w: number; n: number; parent: N | null }
    let nid = 0;
    const mk = (b: string[], move: number, player: string, parent: N | null): N => ({ id: 'm' + nid++, move, player, board: b, kids: [], untried: winner(b) ? [] : b.map((c, i) => (c === '.' ? i : -1)).filter((i) => i >= 0), w: 0, n: 0, parent });
    const other = (p: string) => (p === 'X' ? 'O' : 'X');
    const root = mk(B0, -1, other(me), null);
    const ucb = (c: N, N: number) => c.w / c.n + 1.4 * Math.sqrt(Math.log(N) / c.n);
    const show = (path: Set<string>, msg: string, line: number) => {
      const children: Record<string, string[]> = {};
      const shown: N[] = [];
      const walk = (n: N, d: number) => { shown.push(n); const ks = d < 2 ? n.kids.filter((k) => k.n >= (d === 0 ? 1 : Math.max(3, iters / 60))) : []; children[n.id] = ks.map((k) => k.id); ks.forEach((k) => walk(k, d + 1)); };
      walk(root, 0);
      const pos = layoutTree(root.id, children, 54, 80);
      const nodes: GNode[] = shown.map((n) => ({ id: n.id, x: pos[n.id].x, y: pos[n.id].y, label: n.move < 0 ? '根' : `${n.player}${n.move}`, sub: `${n.w.toFixed(0)}/${n.n}`, color: path.has(n.id) ? 'active' : n.parent === root ? 'frontier' : undefined, r: 18 }));
      const edges: GEdge[] = shown.filter((n) => n.parent && children[n.parent.id]?.includes(n.id)).map((n) => ({ from: n.parent!.id, to: n.id, color: path.has(n.id) ? 'path' : undefined }));
      const bc: CM = {};
      const best = root.kids.reduce<N | null>((a, k) => (!a || k.n > a.n ? k : a), null);
      root.kids.forEach((k) => (bc[`${Math.floor(k.move / 3)},${k.move % 3}`] = k === best ? 'done' : 'frontier'));
      const bd = Array.from({ length: 3 }, (_, i) => Array.from({ length: 3 }, (_, j) => { const k = root.kids.find((x) => x.move === i * 3 + j); return B0[i * 3 + j] !== '.' ? B0[i * 3 + j] : k ? `${((k.w / k.n) * 100).toFixed(0)}%·${k.n}` : ''; }));
      r.snap(msg, [{ type: 'graph', nodes, edges, title: '搜尋樹（節點下方：勝場/次數，只顯示前兩層較常走訪的節點）' }, table(bd, bc, { title: `${me} 的候選走法（勝率·次數）`, w: 'half' })], line);
    };
    show(new Set(), `目前輪到 ${me}`, 1);
    const every = Math.max(1, Math.floor(iters / 40));
    for (let it = 1; it <= iters; it++) {
      let n = root;
      const path = new Set([root.id]);
      while (!n.untried.length && n.kids.length) { const N = n.n; n = n.kids.reduce((a, k) => (ucb(k, N) > ucb(a, N) ? k : a)); path.add(n.id); }
      if (n.untried.length) {
        const m = n.untried.splice(Math.floor(rand() * n.untried.length), 1)[0];
        const nb = [...n.board]; const p = other(n.player); nb[m] = p;
        const c = mk(nb, m, p, n);
        n.kids.push(c); n = c; path.add(c.id);
      }
      const sim = [...n.board];
      let turn = other(n.player);
      while (!winner(sim)) { const empt = sim.map((c, i) => (c === '.' ? i : -1)).filter((i) => i >= 0); sim[empt[Math.floor(rand() * empt.length)]] = turn; turn = other(turn); }
      const w = winner(sim);
      for (let x: N | null = n; x; x = x.parent) { x.n++; x.w += w === 'draw' ? 0.5 : w === x.player ? 1 : 0; }
      if (it % every === 0 || it === iters) show(path, `第 ${it} 次迭代：選擇路徑（藍）→ 模擬結果 ${w === 'draw' ? '和局' : w + ' 勝'} → 反向傳播`, it === iters ? 6 : 5);
    }
    const best = root.kids.reduce((a, k) => (k.n > a.n ? k : a), root.kids[0]);
    if (best) show(new Set([root.id, best.id]), `建議走法：第 ${best.move} 格（列 ${Math.floor(best.move / 3)}、行 ${best.move % 3}），走訪 ${best.n} 次，勝率 ${((best.w / best.n) * 100).toFixed(1)}%`, 6);
    return r.frames;
  },
};

// ---------------- 數值方法 ----------------

type Fn = { f: (x: number) => number; d: (x: number) => number; label: string; range: [number, number] };
const FNS: Record<string, Fn> = {
  cubic: { f: (x) => x ** 3 - 2 * x - 5, d: (x) => 3 * x * x - 2, label: 'x³ − 2x − 5', range: [-1, 4] },
  cos: { f: (x) => Math.cos(x) - x, d: (x) => -Math.sin(x) - 1, label: 'cos x − x', range: [-1, 3] },
  sqrt2: { f: (x) => x * x - 2, d: (x) => 2 * x, label: 'x² − 2', range: [-0.5, 3] },
  exp: { f: (x) => Math.exp(x) - 3 * x, d: (x) => Math.exp(x) - 3, label: 'eˣ − 3x', range: [-1, 3] },
};
const fnSel = () => inSelect('fn', '函數 f(x)', Object.entries(FNS).map(([k, v]) => [k, v.label]));
const curve = (F: Fn, a = F.range[0], b = F.range[1]): [number, number][] => Array.from({ length: 121 }, (_, i) => { const x = a + ((b - a) * i) / 120; return [x, F.f(x)]; });

const bisection: AlgoDef = {
  id: 'bisection', name: '二分求根', en: 'Bisection Method', cat: 'numeric',
  desc: '若連續函數在 [a, b] 兩端異號，中間必有根（勝負值定理）。每次取中點 m，保留與 f(m) 異號的那一半，區間長度每步減半。保證收斂但較慢（線性收斂）。',
  time: 'O(log((b−a)/ε))', space: 'O(1)',
  code: ['要求 f(a)·f(b) < 0', 'while b - a > ε:', '  m = (a + b) / 2', '  if f(a)·f(m) <= 0: b = m', '  else: a = m', 'return (a + b) / 2'],
  inputs: [fnSel(), inNum('a', 'a', 1, -10, 10), inNum('b', 'b', 3, -10, 10), inNum('steps', '最多步數', 15, 1, 50)],
  run({ fn, a, b, steps }) {
    const r = new Rec();
    const F = FNS[fn];
    if (F.f(a) * F.f(b) > 0) { r.snap(`f(${a}) = ${F.f(a).toFixed(3)} 與 f(${b}) = ${F.f(b).toFixed(3)} 同號，無法保證有根`, [{ type: 'plot', axes: true, curves: [{ pts: curve(F) }] }], 1); return r.frames; }
    const rows: (string | number)[][] = [];
    for (let k = 0; k < steps; k++) {
      const m = (a + b) / 2;
      rows.push([k, +a.toFixed(6), +b.toFixed(6), +m.toFixed(6), +F.f(m).toFixed(6)]);
      r.snap(`第 ${k + 1} 步：m = ${m.toFixed(6)}，f(m) = ${F.f(m).toFixed(6)}`, [{ type: 'plot', axes: true, curves: [{ pts: curve(F) }], polygons: [{ pts: [[a, -1e3], [b, -1e3], [b, 1e3], [a, 1e3]], color: 'frontier', fill: true }], bounds: [F.range[0], F.range[1], Math.min(...curve(F).map((p) => p[1])), Math.max(...curve(F).map((p) => p[1]))], points: [{ x: a, y: F.f(a), color: 'active', label: 'a' }, { x: b, y: F.f(b), color: 'active', label: 'b' }, { x: m, y: F.f(m), color: 'bad', label: 'm' }] }, table(rows, {}, { colHeaders: ['步', 'a', 'b', 'm', 'f(m)'] })], 3);
      if (F.f(a) * F.f(m) <= 0) b = m; else a = m;
    }
    r.snap(`根 ≈ ${((a + b) / 2).toFixed(8)}`, [table(rows, {}, { colHeaders: ['步', 'a', 'b', 'm', 'f(m)'] })], 6);
    return r.frames;
  },
};

const newton: AlgoDef = {
  id: 'newton-method', name: '牛頓法', en: "Newton's Method", cat: 'numeric',
  desc: '從初始猜測 x₀ 出發，在 (x, f(x)) 畫切線，切線與 x 軸的交點即為下一個猜測：x ← x − f(x)/f′(x)。在根附近為二次收斂（每步有效位數約加倍），但初始值不好時可能發散。',
  time: '每步 O(1)，二次收斂', space: 'O(1)',
  code: ['x = x0', 'repeat:', '  x_new = x - f(x) / f\'(x)', '  if |x_new - x| < ε: break', '  x = x_new', 'return x'],
  inputs: [fnSel(), inNum('x0', '初始值 x₀', 3, -10, 10), inNum('steps', '最多步數', 8, 1, 30)],
  run({ fn, x0, steps }) {
    const r = new Rec();
    const F = FNS[fn];
    let x = x0;
    const rows: (string | number)[][] = [];
    const tangents: PlotPanel['segments'] = [];
    const ys = curve(F).map((p) => p[1]);
    const bd: [number, number, number, number] = [F.range[0], F.range[1], Math.min(...ys), Math.max(...ys)];
    for (let k = 0; k < steps; k++) {
      const fx = F.f(x), dx = F.d(x);
      if (Math.abs(dx) < 1e-12) { r.snap('導數為 0，無法繼續', [], 3); break; }
      const nx = x - fx / dx;
      rows.push([k, +x.toFixed(10), +fx.toExponential(3), +nx.toFixed(10)]);
      tangents!.push({ x1: x, y1: fx, x2: nx, y2: 0, color: 'swap', width: 1.5 }, { x1: x, y1: 0, x2: x, y2: fx, color: 'muted', dashed: true, width: 1 });
      r.snap(`第 ${k + 1} 步：x = ${x.toFixed(8)}，切線交 x 軸於 ${nx.toFixed(8)}`, [{ type: 'plot', axes: true, bounds: bd, curves: [{ pts: curve(F) }], segments: [...tangents!], points: [{ x, y: fx, color: 'active', label: 'x' + k }, { x: nx, y: 0, color: 'bad' }] }, table(rows, {}, { colHeaders: ['步', 'x', 'f(x)', 'x_new'] })], 3);
      if (Math.abs(nx - x) < 1e-12) { x = nx; break; }
      x = nx;
    }
    r.snap(`根 ≈ ${x.toFixed(12)}（f(x) = ${F.f(x).toExponential(2)}）`, [table(rows, {}, { colHeaders: ['步', 'x', 'f(x)', 'x_new'] })], 6);
    return r.frames;
  },
};

const GD: Record<string, { f: (x: number) => number; d: (x: number) => number; label: string; range: [number, number] }> = {
  quad: { f: (x) => (x - 2) ** 2 + 1, d: (x) => 2 * (x - 2), label: '(x − 2)² + 1', range: [-3, 7] },
  wavy: { f: (x) => 0.1 * x * x + Math.sin(2 * x), d: (x) => 0.2 * x + 2 * Math.cos(2 * x), label: '0.1x² + sin 2x（有多個局部極小）', range: [-6, 6] },
  quartic: { f: (x) => x ** 4 - 3 * x ** 2 + x, d: (x) => 4 * x ** 3 - 6 * x + 1, label: 'x⁴ − 3x² + x', range: [-2.2, 2.2] },
};

const gradient: AlgoDef = {
  id: 'gradient-descent', name: '梯度下降', en: 'Gradient Descent', cat: 'ml',
  desc: '沿著負梯度方向一步步走向函數的極小值：x ← x − η·f′(x)。學習率 η 太小收斂慢，太大會震盪甚至發散；非凸函數可能停在局部極小值。試著調整 η 與起點比較。',
  time: '每步 O(1)', space: 'O(1)',
  code: ['x = x0', 'repeat steps 次:', '  g = f\'(x)', '  x = x - η · g', '  if |g| < ε: break'],
  inputs: [inSelect('fn', '函數', Object.entries(GD).map(([k, v]) => [k, v.label])), inNum('x0', '起點 x₀', 5.5, -10, 10), { key: 'lr', label: '學習率 η', type: 'text', default: '0.1', random: () => rnd.pick(['0.05', '0.1', '0.3', '0.9', '1.05']) }, inNum('steps', '步數', 25, 1, 200)],
  run({ fn, x0, lr, steps }) {
    const r = new Rec();
    const F = GD[fn];
    const eta = Number(lr) || 0.1;
    let x = x0;
    const trail: [number, number][] = [[x, F.f(x)]];
    const cv = Array.from({ length: 161 }, (_, i) => { const t = F.range[0] + ((F.range[1] - F.range[0]) * i) / 160; return [t, F.f(t)] as [number, number]; });
    const ys = cv.map((p) => p[1]);
    for (let k = 0; k < steps; k++) {
      const g = F.d(x);
      const nx = x - eta * g;
      r.snap(`第 ${k + 1} 步：f′(${x.toFixed(4)}) = ${g.toFixed(4)}，x ← ${x.toFixed(4)} − ${eta}×${g.toFixed(4)} = ${nx.toFixed(4)}`, [{ type: 'plot', axes: true, bounds: [F.range[0], F.range[1], Math.min(...ys) - 0.5, Math.max(...ys)], curves: [{ pts: cv }, { pts: [...trail, [nx, F.f(nx)]], color: 'swap', width: 1.5 }], points: [...trail.map(([a, b]) => ({ x: a, y: b, color: 'muted' as Color, r: 3 })), { x: nx, y: F.f(nx), color: 'bad', r: 6 }] }, vars({ x: +nx.toFixed(5), 'f(x)': +F.f(nx).toFixed(5), 梯度: +g.toFixed(5) })], 4);
      x = nx;
      trail.push([x, F.f(x)]);
      if (!Number.isFinite(x) || Math.abs(x) > 1e6) { r.snap('發散了！學習率太大', [], 4); break; }
      if (Math.abs(g) < 1e-6) { r.snap('梯度幾乎為 0，收斂', [], 5); break; }
    }
    r.snap(`結束於 x = ${x.toFixed(6)}，f(x) = ${F.f(x).toFixed(6)}`, [{ type: 'plot', axes: true, bounds: [F.range[0], F.range[1], Math.min(...ys) - 0.5, Math.max(...ys)], curves: [{ pts: cv }, { pts: trail, color: 'swap', width: 1.5 }], points: [{ x, y: F.f(x), color: 'done', r: 7 }] }]);
    return r.frames;
  },
};

const gauss: AlgoDef = {
  id: 'gaussian-elimination', name: '高斯消去法', en: 'Gaussian Elimination (Partial Pivoting)', cat: 'numeric',
  desc: '解線性方程組 Ax = b：對增廣矩陣 [A | b] 做列運算化為上三角（每一欄先挑絕對值最大的列當主元，以提升數值穩定性），再由下往上回代求解。',
  time: 'O(n³)', space: 'O(n²)',
  code: ['for col = 0 .. n-1:', '  pivot = 該欄 |值| 最大的列；與目前列交換', '  for 下方每一列 r:', '    factor = M[r][col] / M[col][col]', '    M[r] -= factor · M[col]', '回代：for i = n-1 .. 0:', '  x[i] = (b[i] - Σ M[i][j]·x[j]) / M[i][i]'],
  inputs: [{ key: 'm', label: '增廣矩陣 [A | b]（每行一個方程式）', type: 'text', multiline: true, default: '2 1 -1 8\n-3 -1 2 -11\n-2 1 2 -3', random: () => { const n = rnd.int(2, 4); const x = rnd.arr(n, -5, 5); return Array.from({ length: n }, () => { const a = rnd.arr(n, -6, 6); return [...a, a.reduce((s, v, i) => s + v * x[i], 0)].join(' '); }).join('\n'); } }],
  run({ m }) {
    const r = new Rec();
    const M = String(m).trim().split('\n').map((l) => l.trim().split(/\s+/).map(Number));
    const n = M.length;
    const T = (hl: CM = {}) => table(M.map((row) => row.map((v) => +v.toFixed(4))), hl, { colHeaders: [...Array.from({ length: n }, (_, i) => 'x' + i), 'b'], rowHeaders: M.map((_, i) => 'R' + i) });
    r.snap('增廣矩陣', [T()], 1);
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let i = c + 1; i < n; i++) if (Math.abs(M[i][c]) > Math.abs(M[p][c])) p = i;
      if (Math.abs(M[p][c]) < 1e-12) { r.snap(`第 ${c} 欄沒有非零主元 → 矩陣奇異，無唯一解`, [T()], 2); return r.frames; }
      if (p !== c) { [M[p], M[c]] = [M[c], M[p]]; r.snap(`第 ${c} 欄絕對值最大在 R${p}，交換 R${c} ↔ R${p}`, [T(Object.fromEntries(M[c].map((_, j) => [`${c},${j}`, 'swap' as Color])))], 2); }
      else r.snap(`主元 M[${c}][${c}] = ${+M[c][c].toFixed(4)}`, [T({ [`${c},${c}`]: 'special' })], 2);
      for (let i = c + 1; i < n; i++) {
        const f = M[i][c] / M[c][c];
        if (!f) continue;
        for (let j = c; j <= n; j++) M[i][j] -= f * M[c][j];
        r.snap(`R${i} −= ${+f.toFixed(4)} × R${c}`, [T({ [`${c},${c}`]: 'special', ...Object.fromEntries(M[i].map((_, j) => [`${i},${j}`, 'active' as Color])) })], 5);
      }
    }
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let s = M[i][n];
      for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j];
      x[i] = s / M[i][i];
      r.snap(`回代：x${i} = ${+x[i].toFixed(6)}`, [T(Object.fromEntries(M[i].map((_, j) => [`${i},${j}`, 'done' as Color]))), cells(x.map((v, k) => (k >= i ? +v.toFixed(6) : '?')), {}, { title: '解 x', headers: x.map((_, k) => 'x' + k) })], 7);
    }
    r.snap(`解：${x.map((v, i) => `x${i} = ${+v.toFixed(6)}`).join('，')}`, [T(), cells(x.map((v) => +v.toFixed(6)), Object.fromEntries(x.map((_, i) => [i, 'done'])), { title: '解 x', headers: x.map((_, k) => 'x' + k) })]);
    return r.frames;
  },
};

// ---------------- 機器學習 ----------------

const blobs = (seed: number, k = 3, per = 12) => {
  const rand = seeded(seed);
  const out: string[] = [];
  for (let c = 0; c < k; c++) {
    const cx = 2 + rand() * 16, cy = 2 + rand() * 16;
    for (let i = 0; i < per; i++) out.push(`${(cx + (rand() - 0.5) * 6).toFixed(1)} ${(cy + (rand() - 0.5) * 6).toFixed(1)}`);
  }
  return out.join('; ');
};
const parsePts = (s: string) => String(s).split(';').map((x) => x.trim().split(/\s+/).map(Number)).filter((x) => x.length >= 2 && !isNaN(x[0]));
const CL: Color[] = ['active', 'bad', 'good', 'special', 'compare', 'frontier', 'visited', 'path'];

const kmeans: AlgoDef = {
  id: 'k-means', name: 'K 平均分群', en: 'K-Means Clustering (Lloyd)', cat: 'ml',
  desc: '先隨機選 k 個中心，然後反覆兩步直到不再變動：①分配：每個點歸給最近的中心；②更新：中心移到所屬點的平均位置。結果與初始中心有關（實務上常用 k-means++ 初始化）。',
  time: 'O(n · k · 迭代數)', space: 'O(n + k)',
  code: ['隨機選 k 個點作為初始中心', 'repeat:', '  分配：每個點 → 最近的中心', '  更新：中心 = 所屬點的平均', '  if 分配不再改變: break'],
  inputs: [inText('pts', '點（x y，以 ; 分隔）', blobs(7), () => blobs(rnd.int(1, 9999), rnd.int(2, 4))), inNum('k', 'k', 3, 1, 8), inSeed()],
  run({ pts, k, seed }) {
    const r = new Rec();
    const S = parsePts(pts);
    const rand = seeded(seed);
    k = Math.min(k, S.length);
    let C = [...S].sort(() => rand() - 0.5).slice(0, k).map((p) => [...p]);
    let asg = new Array(S.length).fill(-1);
    const view = (msg: string, line: number, lines = false) => r.snap(msg, [{ type: 'plot', square: true, points: [...S.map(([x, y], i) => ({ x, y, color: asg[i] >= 0 ? CL[asg[i] % CL.length] : 'muted' as Color, r: 4 })), ...C.map(([x, y], j) => ({ x, y, color: CL[j % CL.length], r: 10, label: 'C' + j }))], segments: lines ? S.map(([x, y], i) => ({ x1: x, y1: y, x2: C[asg[i]][0], y2: C[asg[i]][1], color: 'muted' as Color, width: 0.7 })) : [] }, vars({ k })], line);
    view(`隨機選 ${k} 個初始中心（大圓點）`, 1);
    for (let it = 1; it <= 20; it++) {
      const na = S.map(([x, y]) => C.reduce((b, c, j) => (Math.hypot(x - c[0], y - c[1]) < Math.hypot(x - C[b][0], y - C[b][1]) ? j : b), 0));
      const changed = na.some((v, i) => v !== asg[i]);
      asg = na;
      view(`第 ${it} 輪：把每個點分給最近的中心`, 3, true);
      if (!changed) { view(`分配沒有改變，收斂（${it} 輪）`, 5); break; }
      C = C.map((c, j) => { const mem = S.filter((_, i) => asg[i] === j); return mem.length ? [mem.reduce((s, p) => s + p[0], 0) / mem.length, mem.reduce((s, p) => s + p[1], 0) / mem.length] : c; });
      view(`第 ${it} 輪：中心移到群內點的平均位置`, 4);
    }
    return r.frames;
  },
};

const knn: AlgoDef = {
  id: 'k-nn', name: 'K 近鄰分類', en: 'k-Nearest Neighbors', cat: 'ml',
  desc: '「懶惰學習」：不事先訓練。預測新點時，找出距離最近的 k 個訓練點，以多數決決定類別。k 太小容易受雜訊影響，k 太大會模糊邊界。',
  time: '每次查詢 O(n log n)', space: 'O(n)',
  code: ['for 每個訓練點 p: d = dist(query, p)', '依距離排序', '取前 k 個', '統計各類別票數', '預測 = 票數最多的類別'],
  inputs: [inText('pts', '訓練資料（x y 類別，以 ; 分隔）', '2 3 0; 3 5 0; 4 2 0; 1 6 0; 5 4 0; 3 3 0; 8 8 1; 9 6 1; 7 9 1; 10 8 1; 8 6 1; 6 7 1; 5 9 2; 3 9 2; 4 10 2; 2 8 2', () => { const rand = seeded(rnd.int(1, 9999)); return Array.from({ length: 18 }, (_, i) => { const c = i % 3; const cx = [3, 8, 4][c], cy = [3, 7, 9][c]; return `${(cx + (rand() - 0.5) * 5).toFixed(1)} ${(cy + (rand() - 0.5) * 5).toFixed(1)} ${c}`; }).join('; '); }), inText('q', '查詢點', '6 5', () => `${rnd.int(1, 10)} ${rnd.int(1, 10)}`), inNum('k', 'k', 5, 1, 15)],
  run({ pts, q, k }) {
    const r = new Rec();
    const S = parsePts(pts).map(([x, y, c]) => ({ x, y, c: c || 0 }));
    const [qx, qy] = String(q).trim().split(/\s+/).map(Number);
    k = Math.min(k, S.length);
    const d = S.map((p, i) => ({ i, d: Math.hypot(p.x - qx, p.y - qy) })).sort((a, b) => a.d - b.d);
    const near = new Set(d.slice(0, k).map((x) => x.i));
    const base = (hl: Set<number>, radius?: number) => ({ type: 'plot' as const, square: true, points: [...S.map((p, i) => ({ x: p.x, y: p.y, color: CL[p.c % CL.length], r: hl.has(i) ? 8 : 4 })), { x: qx, y: qy, color: 'muted' as Color, r: 8, label: '?' }], circles: radius ? [{ x: qx, y: qy, r: radius, color: 'muted' as Color }] : [], segments: [...hl].map((i) => ({ x1: qx, y1: qy, x2: S[i].x, y2: S[i].y, color: 'compare' as Color, width: 1 })) });
    r.snap('計算查詢點到每個訓練點的距離', [base(new Set()), table(d.map((x) => [x.i, +x.d.toFixed(3), S[x.i].c]), {}, { colHeaders: ['點', '距離', '類別'], w: 'half' })], 1);
    for (let j = 1; j <= k; j++) {
      const hl = new Set(d.slice(0, j).map((x) => x.i));
      r.snap(`第 ${j} 近：點 ${d[j - 1].i}（類別 ${S[d[j - 1].i].c}，距離 ${d[j - 1].d.toFixed(3)}）`, [base(hl, d[j - 1].d), table(d.map((x) => [x.i, +x.d.toFixed(3), S[x.i].c]), Object.fromEntries(Array.from({ length: j }, (_, t) => [0, 1, 2].map((c) => [`${t},${c}`, 'compare' as Color])).flat()) as CM, { colHeaders: ['點', '距離', '類別'], w: 'half' })], 3);
    }
    const votes: Record<number, number> = {};
    for (const i of near) votes[S[i].c] = (votes[S[i].c] ?? 0) + 1;
    const pred = +Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0];
    const vb = Object.keys(votes).map(Number).sort();
    r.snap(`投票結果：${vb.map((c) => `類別 ${c}: ${votes[c]} 票`).join('，')} → 預測為類別 ${pred}`, [{ ...base(near, d[k - 1].d), points: [...base(near).points.slice(0, -1), { x: qx, y: qy, color: CL[pred % CL.length], r: 10, label: '預測 ' + pred }] }, bars(vb.map((c) => votes[c]), Object.fromEntries(vb.map((c, i) => [i, CL[c % CL.length]])), { labels: vb.map((c) => `類別${c}:${votes[c]}`), title: '票數', w: 'half' })], 5);
    return r.frames;
  },
};

const pagerank: AlgoDef = {
  id: 'pagerank', name: '網頁排名演算法', en: 'PageRank (Power Iteration)', cat,
  desc: '網頁重要性 = 被重要網頁連結的程度。以冪次迭代計算：PR(v) = (1−d)/N + d · Σ PR(u)/outdeg(u)（u 連到 v）；沒有出鏈的節點把分數平均分給所有人。d 為阻尼係數（隨機跳轉的機率為 1−d）。',
  time: 'O(迭代數 · (V + E))', space: 'O(V)',
  code: ['PR[*] = 1 / N', 'repeat 直到收斂:', '  new[v] = (1 - d) / N', '  for 每條邊 u → v: new[v] += d · PR[u] / outdeg(u)', '  懸掛節點的分數平均分配給所有節點', '  PR = new'],
  inputs: [graphInput('A B\nA C\nB C\nC A\nD C\nE A\nE D\nF E\nB D\nD A', { directed: true, n: 6, m: 10 }), { key: 'd', label: '阻尼係數 d', type: 'text', default: '0.85' }, inNum('iters', '迭代次數', 20, 1, 100)],
  run({ graph, d, iters }) {
    const r = new Rec();
    const g = parseGraph(graph, true);
    const N = g.nodes.length;
    const D = Number(d) || 0.85;
    const out: Record<string, number> = Object.fromEntries(g.nodes.map((n) => [n, 0]));
    for (const e of g.edges) out[e.u]++;
    let PR: Record<string, number> = Object.fromEntries(g.nodes.map((n) => [n, 1 / N]));
    const view = (msg: string, line: number, it: number) => {
      const mx = Math.max(...Object.values(PR));
      const g2 = gpanel(g, { sub: Object.fromEntries(g.nodes.map((n) => [n, PR[n].toFixed(3)])), w: 'half' });
      g2.nodes.forEach((nd) => { nd.r = 12 + 22 * (PR[nd.id] / mx); nd.color = 'active'; });
      r.snap(msg, [g2, bars(g.nodes.map((n) => +PR[n].toFixed(4)), {}, { labels: g.nodes.map((n) => `${n}:${PR[n].toFixed(3)}`), title: 'PageRank 值', w: 'half' }), vars({ 迭代: it, d: D })], line);
    };
    view(`初始化：每個節點 1/${N}（節點大小代表分數）`, 1, 0);
    for (let it = 1; it <= iters; it++) {
      const nw: Record<string, number> = Object.fromEntries(g.nodes.map((n) => [n, (1 - D) / N]));
      for (const e of g.edges) nw[e.v] += (D * PR[e.u]) / out[e.u];
      const dangling = g.nodes.filter((n) => !out[n]).reduce((s, n) => s + PR[n], 0);
      for (const n of g.nodes) nw[n] += (D * dangling) / N;
      const delta = g.nodes.reduce((s, n) => s + Math.abs(nw[n] - PR[n]), 0);
      PR = nw;
      view(`第 ${it} 次迭代，變化量 ${delta.toExponential(2)}`, 4, it);
      if (delta < 1e-8) { view(`收斂！排名：${[...g.nodes].sort((a, b) => PR[b] - PR[a]).join(' > ')}`, 6, it); break; }
    }
    return r.frames;
  },
};

const hanoi: AlgoDef = {
  id: 'hanoi', name: '河內塔', en: 'Tower of Hanoi', cat,
  desc: '把 n 個盤子從 A 柱移到 C 柱，一次只能移動一個、大盤不能疊在小盤上。遞迴思路：先把上面 n−1 個移到 B，再把最大的移到 C，最後把 n−1 個從 B 移到 C。共需 2ⁿ − 1 步。',
  time: 'O(2ⁿ)', space: 'O(n)',
  code: ['hanoi(n, from, to, via):', '  if n == 0: return', '  hanoi(n-1, from, via, to)', '  move 盤子 n: from → to', '  hanoi(n-1, via, to, from)'],
  inputs: [inNum('n', '盤子數 n', 4, 1, 8)],
  run({ n }) {
    const r = new Rec();
    const peg: number[][] = [Array.from({ length: n }, (_, i) => n - i), [], []];
    const names = ['A', 'B', 'C'];
    let moves = 0;
    const PAL: Color[] = ['active', 'path', 'good', 'special', 'visited', 'frontier', 'compare', 'swap'];
    const view = (msg: string, line: number, moving = -1) => r.snap(msg, [{
      type: 'plot', bounds: [-0.5, 2.5, -0.5, n + 1], height: 70 + n * 26,
      segments: [...[0, 1, 2].map((p) => ({ x1: p, y1: 0, x2: p, y2: n + 0.6, color: 'muted' as Color, width: 4 })), { x1: -0.5, y1: -0.05, x2: 2.5, y2: -0.05, color: 'muted' as Color, width: 4 },
        ...peg.flatMap((st, p) => st.map((disk, h) => ({ x1: p - (0.12 + (0.33 * disk) / n), y1: h + 0.5, x2: p + (0.12 + (0.33 * disk) / n), y2: h + 0.5, color: disk === moving ? 'bad' : PAL[(disk - 1) % PAL.length], width: 16 })))],
      points: [0, 1, 2].map((p) => ({ x: p - 0.05, y: n + 0.8, label: names[p], r: 0.01 })),
    }, vars({ 步數: moves, 最少步數: 2 ** n - 1 })], line);
    view(`${n} 個盤子在 A 柱`, 1);
    const go = (k: number, a: number, c: number, b: number) => {
      if (!k) return;
      go(k - 1, a, b, c);
      peg[c].push(peg[a].pop()!);
      moves++;
      view(`第 ${moves} 步：盤子 ${k} 從 ${names[a]} 移到 ${names[c]}`, 4, k);
      go(k - 1, b, c, a);
    };
    go(n, 0, 2, 1);
    view(`完成！共 ${moves} 步 = 2^${n} − 1`, 1);
    return r.frames;
  },
};

export default [rle, lz77, lz78, lzw, arith, minimax, alphabeta, mcts, gradient, newton, bisection, gauss, kmeans, knn, pagerank, hanoi];
