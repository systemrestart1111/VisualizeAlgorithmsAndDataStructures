// 擴充的字串、自動機與編碼主題
import type { AlgoDef, Color, GEdge, GNode, Panel } from '../core/types';
import { Rec, bars, cells, inText, rnd, table, text, vars } from '../core/helpers';
import { layoutTree } from '../core/graph';

const cat = 'string';
const short = (s: string, n: number, name = '字串') => {
  if (s.length > n) throw new Error(`${name}最多 ${n} 個字元`);
  return s;
};

// ---------------- 後綴自動機 ----------------
const samDef: AlgoDef = {
  id: 'suffix-automaton', name: '後綴自動機', en: 'Suffix Automaton', cat,
  desc: '接受字串所有子字串的最小 DFA，狀態數不超過 2n。每個狀態代表一群「出現結尾位置相同」的子字串，記錄最長長度 len 與後綴連結 link。逐字元加入：新建狀態 cur，沿 link 往上補上新字元的轉移；遇到已有轉移的狀態 q 時，若 len 剛好連續就直接連，否則複製一個 clone 分裂。相異子字串個數 = Σ(len[v] − len[link[v]])。',
  time: 'O(n·σ)（均攤每字元 O(1) 個新狀態）', space: 'O(n·σ)',
  code: ['cur = 新狀態，len[cur] = len[last] + 1', 'p = last；while p ≠ −1 且 p 沒有 c 的轉移: next[p][c] = cur；p = link[p]', 'if p == −1: link[cur] = 0', 'else q = next[p][c]：', '  若 len[p] + 1 == len[q]: link[cur] = q', '  否則 clone = 複製 q，len[clone] = len[p] + 1；把指向 q 的轉移改指 clone；link[q] = link[cur] = clone', 'last = cur', '相異子字串數 = Σ (len[v] − len[link[v]])'],
  inputs: [inText('s', '字串（≤ 12 字元）', 'abcbcabc', () => rnd.pick(['abcbc', 'aabab', 'banana', 'abcbcabc', 'mississi']))],
  run({ s }) {
    const r = new Rec();
    const S = short(String(s), 12);
    if (!S) throw new Error('請輸入字串');
    const len = [0], link = [-1], next: Record<string, number>[] = [{}];
    const clones = new Set<number>();
    let last = 0;
    const view = (msg: string, line: number, hl: Record<number, Color> = {}) => {
      const n = len.length;
      // 以後綴連結樹排版
      const kids: Record<string, string[]> = Object.fromEntries(Array.from({ length: n }, (_, v) => [`q${v}`, [] as string[]]));
      for (let v = 1; v < n; v++) kids[`q${link[v]}`].push(`q${v}`);
      const pos = layoutTree('q0', kids, 64, 74);
      const nodes: GNode[] = Array.from({ length: n }, (_, v) => ({ id: `q${v}`, x: pos[`q${v}`].x, y: pos[`q${v}`].y, label: String(v), sub: `len ${len[v]}`, color: hl[v] ?? (v === last ? 'active' : clones.has(v) ? 'special' : undefined), r: 15 }));
      const edges: GEdge[] = [];
      for (let v = 1; v < n; v++) edges.push({ from: `q${v}`, to: `q${link[v]}`, dashed: true, color: 'muted', directed: true });
      for (let v = 0; v < n; v++) for (const [c, u] of Object.entries(next[v])) edges.push({ from: `q${v}`, to: `q${u}`, label: c, directed: true, curve: 14 });
      r.snap(msg, [{ type: 'graph', nodes, edges, title: '實線為轉移（標字元），虛線為後綴連結；粉紅為 clone', height: 420 }, vars({ 狀態數: n, last })], line);
    };
    view('初始只有狀態 0（空字串）', 1);
    for (const c of S) {
      const cur = len.length;
      len.push(len[last] + 1); link.push(-1); next.push({});
      let p = last;
      while (p !== -1 && next[p][c] === undefined) { next[p][c] = cur; p = link[p]; }
      if (p === -1) { link[cur] = 0; view(`加入「${c}」：新狀態 ${cur}，沿後綴連結到頂都沒有「${c}」的轉移，link = 0`, 3, { [cur]: 'swap' }); }
      else {
        const q = next[p][c];
        if (len[p] + 1 === len[q]) { link[cur] = q; view(`加入「${c}」：狀態 ${p} 已有轉移到 ${q} 且長度連續，link[${cur}] = ${q}`, 5, { [cur]: 'swap', [q]: 'compare' }); }
        else {
          const cl = len.length;
          len.push(len[p] + 1); link.push(link[q]); next.push({ ...next[q] });
          clones.add(cl);
          while (p !== -1 && next[p][c] === q) { next[p][c] = cl; p = link[p]; }
          link[q] = link[cur] = cl;
          view(`加入「${c}」：${q} 的長度不連續，複製出 clone ${cl}（len ${len[cl]}），${q} 與 ${cur} 的連結都改指向它`, 6, { [cur]: 'swap', [cl]: 'special', [q]: 'compare' });
        }
      }
      last = cur;
    }
    let cnt = 0;
    for (let v = 1; v < len.length; v++) cnt += len[v] - len[link[v]];
    const brute = new Set<string>();
    for (let i = 0; i < S.length; i++) for (let j = i + 1; j <= S.length; j++) brute.add(S.slice(i, j));
    view(`完成：${len.length} 個狀態（≤ 2n − 1 = ${2 * S.length - 1}）。相異非空子字串數 Σ(len − len[link]) = ${cnt}，暴力集合 ${brute.size}${cnt === brute.size ? '，一致' : '，不一致！'}`, 8);
    return r.frames;
  },
};

// ---------------- Ukkonen 後綴樹 ----------------
const ukkonen: AlgoDef = {
  id: 'ukkonen-suffix-tree', name: 'Ukkonen 後綴樹', en: 'Ukkonen Suffix Tree', cat,
  desc: '線上建出壓縮後綴樹（所有後綴組成的壓縮字典樹）。三個技巧讓總時間是 O(n)：葉子的邊結尾指向全域的 end，一次 end++ 就延長所有葉子；用 active point（節點、邊、長度）記住目前要插入的位置；新建的內部節點用 suffix link 連起來，下一次插入可以直接跳過去。字串尾端加上唯一終止符 $，保證每個後綴都結束在葉子。',
  time: 'O(n)（字母表大小視為常數）', space: 'O(n)',
  code: ['for 每個字元 c（第 i 個）:', '  end = i（所有葉子自動延長）；remaining += 1', '  while remaining > 0:', '    若 active 邊上下一個字元就是 c：active length += 1，結束這一輪（規則 3）', '    否則：在 active point 分裂邊（或在節點直接）長出新葉子（規則 2）', '      上一個新內部節點的 suffix link 指向它；remaining −= 1', '      active node 是根：active length −= 1；否則沿 suffix link 跳', '最後檢查每個後綴都能從根走到'],
  inputs: [inText('s', '字串（自動加上 $，≤ 10 字元）', 'abcabxabcd', () => rnd.pick(['banana', 'abcabxab', 'mississip', 'xabxac', 'aabaab']))],
  run({ s }) {
    const r = new Rec();
    const T = short(String(s).replace(/\$/g, ''), 10) + '$';
    type N = { start: number; end: { v: number }; kids: Map<string, number>; link: number; id: number };
    const nodes: N[] = [];
    const leafEnd = { v: -1 };
    const mk = (start: number, end: { v: number }) => { nodes.push({ start, end, kids: new Map(), link: 0, id: nodes.length }); return nodes.length - 1; };
    const root = mk(-1, { v: -1 });
    let aNode = root, aEdge = 0, aLen = 0, rem = 0;
    const elen = (u: number) => nodes[u].end.v - nodes[u].start + 1;
    const view = (msg: string, line: number, hl: Record<number, Color> = {}) => {
      const kids: Record<string, string[]> = {};
      const walk = (u: number) => { kids[`n${u}`] = [...nodes[u].kids.keys()].sort().map((c) => `n${nodes[u].kids.get(c)}`); for (const v of nodes[u].kids.values()) walk(v); };
      walk(root);
      const pos = layoutTree(`n${root}`, kids, 66, 70);
      const ids = Object.keys(kids).map((k) => +k.slice(1));
      const gn: GNode[] = ids.map((u) => ({ id: `n${u}`, x: pos[`n${u}`].x, y: pos[`n${u}`].y, label: nodes[u].kids.size ? '' : String(suffixStart(u)), r: 10, color: hl[u] ?? (u === aNode ? 'active' : nodes[u].kids.size ? undefined : 'done') }));
      const ge: GEdge[] = [];
      for (const u of ids) for (const v of nodes[u].kids.values()) ge.push({ from: `n${u}`, to: `n${v}`, label: T.slice(nodes[v].start, nodes[v].end.v + 1) });
      for (const u of ids) if (u !== root && nodes[u].kids.size && nodes[u].link !== root) ge.push({ from: `n${u}`, to: `n${nodes[u].link}`, dashed: true, color: 'special', directed: true, curve: 20 });
      r.snap(msg, [{ type: 'graph', nodes: gn, edges: ge, title: '綠色為葉子（標示後綴起點），藍色為 active node，粉紅虛線為 suffix link', height: 440 }, vars({ end: leafEnd.v, 'active node': aNode === root ? 'root' : aNode, 'active edge': aLen ? T[aEdge] : '—', 'active length': aLen, remaining: rem })], line);
    };
    const depthOf = (u: number): number => { let d = 0; const go = (x: number, acc: number): boolean => { if (x === u) { d = acc; return true; } for (const v of nodes[x].kids.values()) if (go(v, acc + elen(v))) return true; return false; }; go(root, 0); return d; };
    const suffixStart = (u: number) => T.length - depthOf(u);
    for (let i = 0; i < T.length; i++) {
      leafEnd.v = i;
      rem++;
      let lastNew = -1;
      while (rem > 0) {
        if (aLen === 0) aEdge = i;
        const c = T[aEdge];
        if (!nodes[aNode].kids.has(c)) {
          const leaf = mk(i, leafEnd);
          nodes[aNode].kids.set(c, leaf);
          if (lastNew !== -1) { nodes[lastNew].link = aNode; lastNew = -1; }
          view(`規則 2：從 ${aNode === root ? '根' : '節點 ' + aNode} 長出新葉子「${T.slice(i)}」`, 5, { [leaf]: 'swap' });
        } else {
          const nxt = nodes[aNode].kids.get(c)!;
          if (aLen >= elen(nxt)) { aEdge += elen(nxt); aLen -= elen(nxt); aNode = nxt; continue; }
          if (T[nodes[nxt].start + aLen] === T[i]) {
            if (lastNew !== -1 && aNode !== root) { nodes[lastNew].link = aNode; lastNew = -1; }
            aLen++;
            view(`規則 3：「${T[i]}」已經在 active 邊上，active length 變成 ${aLen}，這一輪結束（還剩 ${rem} 個後綴延後處理）`, 4);
            break;
          }
          const split = mk(nodes[nxt].start, { v: nodes[nxt].start + aLen - 1 });
          nodes[aNode].kids.set(c, split);
          const leaf = mk(i, leafEnd);
          nodes[split].kids.set(T[i], leaf);
          nodes[nxt].start += aLen;
          nodes[split].kids.set(T[nodes[nxt].start], nxt);
          if (lastNew !== -1) nodes[lastNew].link = split;
          lastNew = split;
          view(`規則 2：在邊中間分裂出內部節點 ${split}，長出新葉子`, 6, { [split]: 'special', [leaf]: 'swap' });
        }
        rem--;
        if (aNode === root && aLen > 0) { aLen--; aEdge = i - rem + 1; }
        else if (aNode !== root) aNode = nodes[aNode].link;
      }
    }
    // 驗證所有後綴
    const has = (suf: string) => { let u = root, k = 0; while (k < suf.length) { const v = nodes[u].kids.get(suf[k]); if (v === undefined) return false; const lab = T.slice(nodes[v].start, nodes[v].end.v + 1); if (suf.slice(k, k + lab.length) !== lab.slice(0, Math.min(lab.length, suf.length - k))) return false; k += lab.length; u = v; } return true; };
    const ok = Array.from({ length: T.length }, (_, i) => T.slice(i)).every(has);
    const leaves = nodes.filter((x) => x.id !== root && !x.kids.size).length;
    view(`完成：${leaves} 片葉子對應 ${T.length} 個後綴；逐一從根走訪所有後綴${ok ? '都找得到' : '有缺漏！'}`, 8);
    return r.frames;
  },
};

// ---------------- 回文樹 ----------------
const eertree: AlgoDef = {
  id: 'eertree', name: '回文樹', en: 'Palindromic Tree (Eertree)', cat,
  desc: '儲存字串中所有相異回文子字串的結構，最多 n + 2 個節點。有兩個虛根：長度 −1（讓單一字元可以成為回文）與長度 0。每個節點記錄回文長度與「最長回文後綴」連結。加入字元 c 時，從目前最長回文後綴往上找第一個前後都能接上 c 的回文 X，cXc 若不存在就新增節點，再用同樣方法找它的後綴連結。',
  time: 'O(n)（均攤）', space: 'O(n·σ)',
  code: ['節點 1：長度 −1；節點 2：長度 0；link[2] = 1', 'for i, c in s:', '  cur = last；while s[i − len[cur] − 1] ≠ c: cur = link[cur]', '  若 cur 已有 c 的子節點：last = 它；continue', '  新節點 v：len[v] = len[cur] + 2', '  找後綴連結：從 link[cur] 往上找能接上 c 的節點 w，link[v] = w 的 c 子節點（len 為 1 時連到長度 0 的根）', '  last = v'],
  inputs: [inText('s', '字串（≤ 16 字元）', 'abacabadab', () => rnd.pick(['eertree', 'abacaba', 'aabbaa', 'banana', 'abacabadab']))],
  run({ s }) {
    const r = new Rec();
    const S = short(String(s), 16);
    if (!S) throw new Error('請輸入字串');
    const len = [0, -1, 0], link = [0, 1, 1], kids: Record<string, number>[] = [{}, {}, {}], pal: string[] = ['', '(−1)', '(0)'];
    let last = 2;
    const view = (msg: string, line: number, hl: Record<number, Color> = {}) => {
      const n = len.length;
      const tk: Record<string, string[]> = { top: ['e1', 'e2'] };
      for (let v = 1; v < n; v++) tk[`e${v}`] = Object.values(kids[v]).map((u) => `e${u}`);
      const pos = layoutTree('top', tk, 58, 66);
      const nodes: GNode[] = Array.from({ length: n - 1 }, (_, k) => k + 1).map((v) => ({ id: `e${v}`, x: pos[`e${v}`].x, y: pos[`e${v}`].y, label: v <= 2 ? (v === 1 ? '−1' : '0') : pal[v], shape: 'rect', w: Math.max(30, pal[v].length * 9 + 12), h: 26, color: hl[v] ?? (v === last ? 'active' : v <= 2 ? 'muted' : undefined) }));
      const edges: GEdge[] = [];
      for (let v = 1; v < n; v++) for (const [c, u] of Object.entries(kids[v])) edges.push({ from: `e${v}`, to: `e${u}`, label: c });
      for (let v = 3; v < n; v++) edges.push({ from: `e${v}`, to: `e${link[v]}`, dashed: true, color: 'special', directed: true, curve: 16 });
      r.snap(msg, [{ type: 'graph', nodes, edges, title: '實線：兩邊各加一個字元；粉紅虛線：最長回文後綴', height: 420 }, cells(S.split(''), {}, { title: '字串' }), vars({ 相異回文數: n - 3 })], line);
    };
    view('兩個虛根：長度 −1 與 0', 1);
    for (let i = 0; i < S.length; i++) {
      const c = S[i];
      const fits = (v: number) => i - len[v] - 1 >= 0 && S[i - len[v] - 1] === c;
      let cur = last;
      while (!fits(cur)) cur = link[cur];
      if (kids[cur][c] !== undefined) { last = kids[cur][c]; view(`第 ${i} 個字元「${c}」：回文「${pal[last]}」已存在`, 4, { [last]: 'compare' }); continue; }
      const v = len.length;
      len.push(len[cur] + 2);
      pal.push(len[v] === 1 ? c : c + (cur > 2 ? pal[cur] : '') + c);
      kids.push({});
      if (len[v] === 1) link.push(2);
      else { let w = link[cur]; while (!fits(w)) w = link[w]; link.push(kids[w][c]); }
      kids[cur][c] = v;
      last = v;
      view(`第 ${i} 個字元「${c}」：在 ${cur <= 2 ? `長度 ${len[cur]} 的根` : `「${pal[cur]}」`} 兩側加上 ${c}，新回文「${pal[v]}」，最長回文後綴是「${link[v] <= 2 ? '空' : pal[link[v]]}」`, 6, { [v]: 'swap', [link[v]]: 'compare' });
    }
    const brute = new Set<string>();
    for (let i = 0; i < S.length; i++) for (let j = i + 1; j <= S.length; j++) { const t = S.slice(i, j); if (t === [...t].reverse().join('')) brute.add(t); }
    view(`完成：共 ${len.length - 3} 個相異回文；暴力枚舉得到 ${brute.size}${brute.size === len.length - 3 ? '，一致' : '，不一致！'}`, 7);
    return r.frames;
  },
};

// ---------------- Shift-And ----------------
const shiftAnd: AlgoDef = {
  id: 'shift-and', name: 'Shift-And 位元字串匹配', en: 'Shift-And (Bitap)', cat,
  desc: '用一個整數 D 的每個位元同時追蹤「模式的前 j+1 個字元目前是否匹配」。預先為每個字元 c 建遮罩 B[c]（模式中 c 出現的位置為 1）。讀入文字字元時 D = ((D << 1) | 1) & B[c]，第 m−1 位為 1 就代表找到一次完整匹配。一次位元運算平行更新所有部分匹配；模式長度受字寬限制（這裡 31），更長需要分塊。',
  time: 'O(n · ⌈m / w⌉)', space: 'O(σ + m)',
  code: ['for j, c in pattern: B[c] |= 1 << j', 'D = 0', 'for i, c in text:', '  D = ((D << 1) | 1) & B[c]', '  if D & (1 << (m − 1)): 在 i − m + 1 找到匹配'],
  inputs: [inText('text', '文字', 'abracadabra cadabra', () => rnd.pick(['abababcab', 'abracadabra cadabra', 'the cat sat on the mat'])), inText('pat', '模式（≤ 31 字元）', 'abra', () => rnd.pick(['aba', 'abra', 'cab', 'at']))],
  run({ text: t, pat }) {
    const r = new Rec();
    const T = short(String(t), 60, '文字'), P = String(pat);
    if (!P) throw new Error('模式不可為空');
    if (P.length > 31) throw new Error('模式超過 31 個字元：超過字寬時需要把遮罩分塊（多個整數）處理');
    const m = P.length;
    const B: Record<string, number> = {};
    for (let j = 0; j < m; j++) B[P[j]] = (B[P[j]] ?? 0) | (1 << j);
    const bits = (x: number) => Array.from({ length: m }, (_, j) => (x >> (m - 1 - j)) & 1);
    r.snap('為每個字元建遮罩：模式中出現的位置為 1（右邊是第 0 位）', [table(Object.entries(B).map(([c, v]) => bits(v)), {}, { rowHeaders: Object.keys(B).map((c) => `B['${c}']`), colHeaders: Array.from({ length: m }, (_, j) => P[m - 1 - j]) })], 1);
    let D = 0;
    const found: number[] = [];
    const rows: (string | number)[][] = [];
    for (let i = 0; i < T.length; i++) {
      D = ((D << 1) | 1) & (B[T[i]] ?? 0);
      const hit = (D >> (m - 1)) & 1;
      if (hit) found.push(i - m + 1);
      rows.push([i, T[i], bits(D).join('')]);
      r.snap(`讀入「${T[i]}」：D = ((D << 1) | 1) & B['${T[i]}'] = ${bits(D).join('')}` + (hit ? `，最高位為 1 → 在位置 ${i - m + 1} 找到匹配` : ''), [cells(T.split(''), Object.fromEntries([...found.flatMap((p) => Array.from({ length: m }, (_, k) => [p + k, 'done' as Color])), [i, 'active' as Color]])), table(rows.slice(-10), Object.fromEntries(rows.slice(-10).map((row, k) => [`${k},2`, String(row[2])[0] === '1' ? 'done' as Color : undefined])), { colHeaders: ['i', '字元', 'D（左邊是最高位）'], w: 'half' })], hit ? 5 : 4);
    }
    const brute: number[] = [];
    for (let i = 0; i + m <= T.length; i++) if (T.slice(i, i + m) === P) brute.push(i);
    r.snap(`找到 ${found.length} 次：位置 ${found.join(', ') || '無'}；暴力比對${brute.join() === found.join() ? '一致' : '不一致！'}`, [cells(T.split(''), Object.fromEntries(found.flatMap((p) => Array.from({ length: m }, (_, k) => [p + k, 'done' as Color]))))], 5);
    return r.frames;
  },
};

// ---------------- 正規表達式 → NFA → DFA → 最小化 ----------------
type NFA = { start: number; accept: number; trans: { from: number; to: number; c: string | null }[]; n: number };
/** Thompson 建構；frames 回呼用於視覺化每個運算子 */
function thompson(re: string, onStep?: (msg: string, frag: { s: number; a: number }, nfa: NFA, line: number) => void): NFA {
  const tokens: string[] = [];
  const src = re.replace(/\s+/g, '');
  if (!src) throw new Error('請輸入正規表達式');
  if (!/^[a-z0-9()|*+?ε]+$/.test(src)) throw new Error('只支援小寫字母、數字、括號與 | * + ? 運算子');
  // 插入明確的連接運算子「.」
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    tokens.push(c);
    const nx = src[i + 1];
    if (nx && !'|)*+?'.includes(nx) && c !== '(' && c !== '|') tokens.push('.');
  }
  // 轉後序（Shunting-yard）
  const prec: Record<string, number> = { '|': 1, '.': 2, '*': 3, '+': 3, '?': 3 };
  const out: string[] = [], ops: string[] = [];
  for (const t of tokens) {
    if (/[a-z0-9ε]/.test(t)) out.push(t);
    else if (t === '(') ops.push(t);
    else if (t === ')') { while (ops.length && ops[ops.length - 1] !== '(') out.push(ops.pop()!); if (!ops.length) throw new Error('括號不成對'); ops.pop(); }
    else { while (ops.length && ops[ops.length - 1] !== '(' && prec[ops[ops.length - 1]] >= prec[t]) out.push(ops.pop()!); ops.push(t); }
  }
  while (ops.length) { const o = ops.pop()!; if (o === '(') throw new Error('括號不成對'); out.push(o); }
  const nfa: NFA = { start: 0, accept: 0, trans: [], n: 0 };
  const st = () => nfa.n++;
  const stack: { s: number; a: number }[] = [];
  const pop = () => { const f = stack.pop(); if (!f) throw new Error('正規表達式格式錯誤'); return f; };
  for (const t of out) {
    if (/[a-z0-9ε]/.test(t)) {
      const s = st(), a = st();
      nfa.trans.push({ from: s, to: a, c: t === 'ε' ? null : t });
      stack.push({ s, a });
      onStep?.(`字元「${t}」：兩個狀態與一條 ${t} 轉移`, { s, a }, nfa, 2);
    } else if (t === '.') {
      const b = pop(), a = pop();
      nfa.trans.push({ from: a.a, to: b.s, c: null });
      stack.push({ s: a.s, a: b.a });
      onStep?.('連接：前一段的接受狀態用 ε 接到後一段的起點', { s: a.s, a: b.a }, nfa, 3);
    } else if (t === '|') {
      const b = pop(), a = pop(), s = st(), e = st();
      nfa.trans.push({ from: s, to: a.s, c: null }, { from: s, to: b.s, c: null }, { from: a.a, to: e, c: null }, { from: b.a, to: e, c: null });
      stack.push({ s, a: e });
      onStep?.('選擇 |：新起點用 ε 分岔到兩段，兩段再用 ε 匯合', { s, a: e }, nfa, 4);
    } else {
      const a = pop(), s = st(), e = st();
      nfa.trans.push({ from: s, to: a.s, c: null }, { from: a.a, to: e, c: null });
      if (t !== '+') nfa.trans.push({ from: s, to: e, c: null });
      if (t !== '?') nfa.trans.push({ from: a.a, to: a.s, c: null });
      stack.push({ s, a: e });
      onStep?.(t === '*' ? '星號 *：可以略過（s → e），也可以重複（回到內部起點）' : t === '+' ? '加號 +：至少走一次，之後可重複' : '問號 ?：可以略過或走一次', { s, a: e }, nfa, 5);
    }
  }
  if (stack.length !== 1) throw new Error('正規表達式格式錯誤');
  nfa.start = stack[0].s; nfa.accept = stack[0].a;
  return nfa;
}
const closure = (nfa: NFA, set: number[]) => { const out = new Set(set); const q = [...set]; while (q.length) { const u = q.pop()!; for (const t of nfa.trans) if (t.from === u && t.c === null && !out.has(t.to)) { out.add(t.to); q.push(t.to); } } return [...out].sort((a, b) => a - b); };
const nfaAccepts = (nfa: NFA, w: string) => { let cur = closure(nfa, [nfa.start]); for (const ch of w) cur = closure(nfa, [...new Set(nfa.trans.filter((t) => cur.includes(t.from) && t.c === ch).map((t) => t.to))]); return cur.includes(nfa.accept); };
const nfaPanel = (nfa: NFA, hl: Set<number> = new Set(), title = 'Thompson NFA（ε 邊為虛線）'): Panel => {
  // 依 BFS 層排版
  const lv: Record<number, number> = { [nfa.start]: 0 };
  const q = [nfa.start];
  for (let h = 0; h < q.length; h++) for (const t of nfa.trans) if (t.from === q[h] && lv[t.to] === undefined) { lv[t.to] = lv[q[h]] + 1; q.push(t.to); }
  const byL: Record<number, number[]> = {};
  for (let s = 0; s < nfa.n; s++) (byL[lv[s] ?? 0] ??= []).push(s);
  const nodes: GNode[] = [];
  for (const [l, ss] of Object.entries(byL)) ss.forEach((s, i) => nodes.push({ id: `s${s}`, x: +l * 70, y: (i - (ss.length - 1) / 2) * 60, label: String(s), r: 14, color: hl.has(s) ? 'active' : s === nfa.accept ? 'done' : s === nfa.start ? 'frontier' : undefined }));
  return { type: 'graph', nodes, edges: nfa.trans.map((t) => ({ from: `s${t.from}`, to: `s${t.to}`, label: t.c ?? 'ε', directed: true, dashed: t.c === null, curve: t.to < t.from ? 24 : 0 })), title, height: 360 };
};
type DFA = { states: number[][]; trans: Record<string, number>[]; accept: boolean[]; alpha: string[] };
function subsetConstruct(nfa: NFA, onStep?: (msg: string, d: DFA, cur: number, line: number) => void): DFA {
  const alpha = [...new Set(nfa.trans.filter((t) => t.c !== null).map((t) => t.c!))].sort();
  const d: DFA = { states: [closure(nfa, [nfa.start])], trans: [{}], accept: [], alpha };
  d.accept[0] = d.states[0].includes(nfa.accept);
  onStep?.(`起始 DFA 狀態 = ε-closure({${nfa.start}}) = {${d.states[0].join(',')}}`, d, 0, 1);
  for (let i = 0; i < d.states.length; i++)
    for (const c of alpha) {
      const mv = [...new Set(nfa.trans.filter((t) => d.states[i].includes(t.from) && t.c === c).map((t) => t.to))];
      if (!mv.length) continue;
      const cl = closure(nfa, mv);
      let j = d.states.findIndex((x) => x.join() === cl.join());
      const isNew = j < 0;
      if (isNew) { j = d.states.length; d.states.push(cl); d.trans.push({}); d.accept[j] = cl.includes(nfa.accept); }
      d.trans[i][c] = j;
      onStep?.(`D${i} 讀「${c}」：move = {${mv.join(',')}}，ε-closure = {${cl.join(',')}}${isNew ? `，新狀態 D${j}` : ` = D${j}`}`, d, i, isNew ? 4 : 5);
    }
  return d;
}
const dfaAccepts = (d: DFA, w: string) => { let s = 0; for (const ch of w) { const nx = d.trans[s]?.[ch]; if (nx === undefined) return false; s = nx; } return d.accept[s]; };
const dfaPanel = (d: DFA, hl: Record<number, Color> = {}, title = 'DFA（雙圈表示接受，這裡以綠色表示）', label?: (i: number) => string): Panel => {
  const n = d.states.length;
  const lv: Record<number, number> = { 0: 0 };
  const q = [0];
  for (let h = 0; h < q.length; h++) for (const j of Object.values(d.trans[q[h]] ?? {})) if (lv[j] === undefined) { lv[j] = lv[q[h]] + 1; q.push(j); }
  const byL: Record<number, number[]> = {};
  for (let s = 0; s < n; s++) (byL[lv[s] ?? 0] ??= []).push(s);
  const nodes: GNode[] = [];
  for (const [l, ss] of Object.entries(byL)) ss.forEach((s, i) => nodes.push({ id: `d${s}`, x: +l * 110, y: (i - (ss.length - 1) / 2) * 80, label: label ? label(s) : `D${s}`, r: 18, color: hl[s] ?? (d.accept[s] ? 'done' : undefined), sub: label ? undefined : `{${d.states[s].join(',')}}` }));
  const edges: GEdge[] = [];
  for (let s = 0; s < n; s++) {
    const grouped: Record<number, string[]> = {};
    for (const [c, j] of Object.entries(d.trans[s] ?? {})) (grouped[j] ??= []).push(c);
    for (const [j, cs] of Object.entries(grouped)) edges.push({ from: `d${s}`, to: `d${j}`, label: cs.join(','), directed: true, curve: +j < s ? 26 : +j === s ? 0 : 6 });
  }
  return { type: 'graph', nodes, edges, title, height: 380 };
};
const TESTS = (alpha: string[], max = 4) => { const out = ['']; for (let L = 1; L <= max; L++) { const prev = out.filter((w) => w.length === L - 1); for (const w of prev) for (const c of alpha) out.push(w + c); } return out; };

const thompsonDef: AlgoDef = {
  id: 'thompson-nfa', name: 'Thompson NFA 建構', en: 'Thompson NFA Construction', cat,
  desc: '把正規表達式轉成 ε-NFA：先插入隱含的連接運算子並轉成後序式，再用堆疊組合「片段」（一個起點、一個接受狀態）。字元是一條轉移；連接用 ε 把兩段串起來；選擇 | 新增起點與終點並用 ε 分岔、匯合；星號 * 加上略過與重複的 ε 邊。每個運算最多新增兩個狀態，因此狀態數 ≤ 2m。',
  time: 'O(m)', space: 'O(m)',
  code: ['插入連接符號並轉成後序式', '字元 c：新增 s —c→ a', '連接 AB：A.accept —ε→ B.start', '選擇 A|B：s —ε→ A、B；A、B —ε→ e', '閉包 A*：s —ε→ A.start、s —ε→ e；A.accept —ε→ A.start、e', '最後堆疊中剩下的片段就是整個 NFA', '模擬：目前狀態集合取 ε-closure 後逐字元移動'],
  inputs: [inText('re', '正規表達式（a-z、|、*、+、?、括號）', '(a|b)*abb', () => rnd.pick(['(a|b)*abb', 'a(b|c)*', 'ab*|ba', '(ab)+c?'])), inText('tests', '測試字串（空白分隔，_ 代表空字串）', 'abb aabb babb ab _ abab', () => rnd.pick(['abb aabb ab _', 'a ab acb b', 'ab ba abbb _']))],
  run({ re, tests }) {
    const r = new Rec();
    const nfa = thompson(String(re), (msg, frag, cur, line) => r.snap(msg, [nfaPanel(cur, new Set([frag.s, frag.a]), '目前已建出的所有片段（藍色為剛組成的片段起訖）')], line));
    r.snap(`完成：${nfa.n} 個狀態、${nfa.trans.length} 條轉移；起點 ${nfa.start}（青色），接受狀態 ${nfa.accept}（綠色）`, [nfaPanel(nfa)], 6);
    const ws = String(tests).split(/\s+/).filter(Boolean).map((w) => (w === '_' ? '' : w));
    const rows: (string | number)[][] = [];
    for (const w of ws) {
      let cur = closure(nfa, [nfa.start]);
      for (const ch of w) cur = closure(nfa, [...new Set(nfa.trans.filter((t) => cur.includes(t.from) && t.c === ch).map((t) => t.to))]);
      const ok = cur.includes(nfa.accept);
      rows.push([w || 'ε', ok ? '接受' : '拒絕']);
      r.snap(`模擬「${w || 'ε'}」：最後的狀態集合 {${cur.join(',')}}${ok ? '包含接受狀態' : '不含接受狀態'}`, [nfaPanel(nfa, new Set(cur)), table(rows, Object.fromEntries(rows.map((row, i) => [`${i},1`, row[1] === '接受' ? 'done' as Color : 'bad' as Color])), { colHeaders: ['字串', '結果'], w: 'half' })], 7);
    }
    return r.frames;
  },
};

const subsetDef: AlgoDef = {
  id: 'subset-construction', name: 'NFA 轉 DFA 子集合建構', en: 'NFA to DFA Subset Construction', cat,
  desc: 'DFA 的每個狀態代表 NFA 的一個「可能所在的狀態集合」。起點是 NFA 起點的 ε-closure；對每個 DFA 狀態與每個字元，先 move 到下一批 NFA 狀態再取 ε-closure，得到的集合若是新的就成為新 DFA 狀態。只要集合中含 NFA 的接受狀態，該 DFA 狀態就是接受狀態。最壞會有 2^n 個狀態，但實際常少很多。',
  time: 'O(2^n · σ)（最壞），通常遠小於此', space: 'O(2^n)',
  code: ['D0 = ε-closure({NFA 起點})', 'queue = [D0]', 'for 每個未處理的 DFA 狀態 S、每個字元 c:', '  T = ε-closure(move(S, c))', '  若 T 是新的集合：加入新狀態', '  trans[S][c] = T', 'S 含 NFA 接受狀態 → S 為接受狀態；以測試字串比對兩台機器'],
  inputs: [inText('re', '正規表達式', '(a|b)*abb', () => rnd.pick(['(a|b)*abb', 'a(b|c)*', 'ab*|ba', '(ab)+c?']))],
  run({ re }) {
    const r = new Rec();
    const nfa = thompson(String(re));
    r.snap(`先用 Thompson 建構得到 ${nfa.n} 個狀態的 NFA`, [nfaPanel(nfa)], 1);
    const d = subsetConstruct(nfa, (msg, dd, cur, line) => r.snap(msg, [nfaPanel(nfa, new Set(dd.states[cur]), 'NFA（藍色為目前 DFA 狀態包含的 NFA 狀態）'), dfaPanel(dd, { [cur]: 'active' }, '建構中的 DFA（下方為對應的 NFA 狀態集合）')], line));
    const tests = TESTS(d.alpha, 5);
    const bad = tests.filter((w) => nfaAccepts(nfa, w) !== dfaAccepts(d, w));
    r.snap(`完成：DFA 有 ${d.states.length} 個狀態（NFA 有 ${nfa.n} 個）。用所有長度 ≤ 5 的 ${tests.length} 個字串比對兩台機器：${bad.length ? `有 ${bad.length} 個不一致！` : '接受結果完全一致'}`, [dfaPanel(d), text(tests.filter((w) => dfaAccepts(d, w)).slice(0, 14).map((w) => w || 'ε'), '部分被接受的字串')], 7);
    return r.frames;
  },
};

const hopcroftDef: AlgoDef = {
  id: 'hopcroft-minimization', name: 'Hopcroft DFA 最小化', en: 'Hopcroft DFA Minimization', cat,
  desc: '把行為相同（對任何後續字串的接受結果都一樣）的 DFA 狀態合併。先補一個「死狀態」讓轉移完整，從「接受／非接受」兩群開始；反覆取出一個分組 A 與字元 c，找出「讀 c 會進入 A」的狀態集合 X，用 X 把每個分組 Y 切成 Y∩X 與 Y∖X。Hopcroft 的技巧是只把較小的那一半放回待處理集合，總時間 O(n σ log n)。',
  time: 'O(n · σ · log n)', space: 'O(n · σ)',
  code: ['補上死狀態，讓每個狀態對每個字元都有轉移', 'P = {接受狀態, 非接受狀態}；W = {較小的一群}', 'while W 非空：取出 A', '  for c in Σ：X = {q | δ(q, c) ∈ A}', '    for P 中每個 Y 被 X 切開：以 Y∩X、Y∖X 取代 Y', '      若 Y 在 W 中：兩半都放入；否則只放入較小的一半', '每個分組成為最小 DFA 的一個狀態；比對兩台機器的語言'],
  inputs: [inText('re', '正規表達式（先轉成 DFA 再最小化）', '(a|b)*abb', () => rnd.pick(['(a|b)*abb', 'a(b|c)*', '(a|b)*a(a|b)', 'ab|ac']))],
  run({ re }) {
    const r = new Rec();
    const d0 = subsetConstruct(thompson(String(re)));
    const n0 = d0.states.length;
    // 補死狀態
    const n = n0 + 1, dead = n0;
    const delta = (q: number, c: string) => (q === dead ? dead : d0.trans[q][c] ?? dead);
    const acc = (q: number) => q !== dead && d0.accept[q];
    const name = (q: number) => (q === dead ? '∅' : `D${q}`);
    let P: number[][] = [Array.from({ length: n }, (_, q) => q).filter(acc), Array.from({ length: n }, (_, q) => q).filter((q) => !acc(q))].filter((x) => x.length);
    const W: number[][] = [P.reduce((a, b) => (a.length <= b.length ? a : b))];
    const showP = (msg: string, line: number, hl?: number[]) => r.snap(msg, [table(P.map((g) => [g.map(name).join(', ')]), Object.fromEntries(P.map((g, i) => [`${i},0`, hl && g.every((q) => hl.includes(q)) ? 'active' as Color : undefined])), { rowHeaders: P.map((_, i) => `組 ${i}`), title: '目前的分割 P' }), table(W.length ? W.map((g) => [g.map(name).join(', ')]) : [['（空）']], {}, { title: '待處理 W', w: 'half' })], line);
    r.snap(`原始 DFA 有 ${n0} 個狀態，補上死狀態 ∅ 讓轉移完整`, [dfaPanel(d0)], 1);
    showP('初始分割：接受狀態一組、其他一組', 2);
    while (W.length) {
      const A = W.shift()!;
      for (const c of d0.alpha) {
        const X = new Set(Array.from({ length: n }, (_, q) => q).filter((q) => A.includes(delta(q, c))));
        const NP: number[][] = [];
        P.forEach((Y, k) => {
          const inter = Y.filter((q) => X.has(q)), diff = Y.filter((q) => !X.has(q));
          if (!inter.length || !diff.length) { NP.push(Y); return; }
          NP.push(inter, diff);
          const wi = W.findIndex((g) => g.join() === Y.join());
          if (wi >= 0) W.splice(wi, 1, inter, diff); else W.push(inter.length <= diff.length ? inter : diff);
          const shown = P;
          P = [...NP, ...shown.slice(k + 1)];
          showP(`用「讀 ${c} 會進入 {${A.map(name).join(',')}}」的狀態把 {${Y.map(name).join(',')}} 切成 {${inter.map(name).join(',')}} 與 {${diff.map(name).join(',')}}`, 5, inter);
          P = shown;
        });
        P = NP;
      }
    }
    // 建出最小 DFA（去掉只含死狀態的組）
    const groupOf = (q: number) => P.findIndex((g) => g.includes(q));
    const start = groupOf(0);
    const keep = P.map((_, i) => i).filter((i) => !(P[i].length === 1 && P[i][0] === dead) && !P[i].every((q) => q === dead));
    const order = [start, ...keep.filter((i) => i !== start)];
    const md: DFA = { states: order.map((i) => P[i].filter((q) => q !== dead)), trans: order.map((i) => { const q = P[i].find((x) => x !== dead) ?? P[i][0]; const t: Record<string, number> = {}; for (const c of d0.alpha) { const g = groupOf(delta(q, c)); if (order.includes(g) && !(P[g].length === 1 && P[g][0] === dead)) t[c] = order.indexOf(g); } return t; }), accept: order.map((i) => acc(P[i].find((x) => x !== dead) ?? dead)), alpha: d0.alpha };
    const tests = TESTS(d0.alpha, 6);
    const bad = tests.filter((w) => dfaAccepts(d0, w) !== dfaAccepts(md, w));
    r.snap(`最小 DFA 有 ${md.states.length} 個狀態（原本 ${n0} 個）；用 ${tests.length} 個長度 ≤ 6 的字串比對：${bad.length ? `${bad.length} 個不一致！` : '語言完全相同'}`, [dfaPanel(md, {}, '最小化後的 DFA（每個狀態是一組原本的狀態）', (i) => `M${i}`), table(md.states.map((g, i) => [`M${i}`, g.map((q) => `D${q}`).join(', ')]), {}, { colHeaders: ['新狀態', '合併的原狀態'], w: 'half' })], 7);
    return r.frames;
  },
};

// ---------------- BWT ----------------
const bwt: AlgoDef = {
  id: 'bwt', name: 'Burrows–Wheeler 轉換', en: 'Burrows–Wheeler Transform', cat,
  desc: '在字串末尾加上唯一且最小的終止符 $，列出所有循環旋轉並排序，取最後一欄就是 BWT。相同的上下文會讓相同字元聚在一起，方便後續用 move-to-front 與游程編碼壓縮（bzip2）。逆轉換利用 LF 映射：第一欄 F 是排序後的 L，L 中第 k 個字元 c 對應 F 中第 k 個 c，從 $ 那一列往回走就能還原原字串。',
  time: '轉換 O(n log n)（用後綴陣列），逆轉換 O(n)', space: 'O(n)',
  code: ['s = s + "$"', '列出 s 的所有循環旋轉並排序', 'L = 每個旋轉的最後一個字元', '逆轉換：F = sort(L)', '  LF[i] = F 中與 L[i] 同字元、同排名的位置', '  從 L 中 $ 所在列開始，沿 LF 往回讀出原字串'],
  inputs: [inText('s', '字串（不可含 $，≤ 14 字元）', 'banana', () => rnd.pick(['banana', 'abracadabra', 'mississippi', 'abcabcabc']))],
  run({ s }) {
    const r = new Rec();
    const S0 = short(String(s), 14);
    if (S0.includes('$')) throw new Error('字串不可含終止符 $');
    const S = S0 + '$';
    const n = S.length;
    const rots = Array.from({ length: n }, (_, i) => S.slice(i) + S.slice(0, i));
    r.snap(`加上終止符後的 ${n} 個循環旋轉`, [table(rots.map((x) => x.split('')), {}, { rowHeaders: rots.map((_, i) => `從 ${i}`) })], 2);
    const order = rots.map((_, i) => i).sort((a, b) => (rots[a] < rots[b] ? -1 : 1));
    const sorted = order.map((i) => rots[i]);
    const L = sorted.map((x) => x[n - 1]).join('');
    r.snap(`排序後取最後一欄：BWT = ${L}`, [table(sorted.map((x) => x.split('')), Object.fromEntries(sorted.flatMap((_, i) => [[`${i},${n - 1}`, 'done' as Color], [`${i},0`, 'visited' as Color]])), { rowHeaders: order.map((i) => `從 ${i}`), colHeaders: ['F', ...Array(n - 2).fill(''), 'L'] })], 3);
    const F = [...L].sort().join('');
    const rank: number[] = [];
    const seen: Record<string, number> = {};
    for (const ch of L) { rank.push(seen[ch] ?? 0); seen[ch] = (seen[ch] ?? 0) + 1; }
    const first: Record<string, number> = {};
    [...F].forEach((ch, i) => { if (first[ch] === undefined) first[ch] = i; });
    const LF = [...L].map((ch, i) => first[ch] + rank[i]);
    r.snap('逆轉換：F = sort(L)，LF[i] = F 中同字元同排名的位置', [table([[...F], [...L], LF], {}, { rowHeaders: ['F', 'L', 'LF'], colHeaders: Array.from({ length: n }, (_, i) => i) })], 5);
    let row = L.indexOf('$');
    const out: string[] = [];
    for (let k = 0; k < n - 1; k++) {
      row = LF[row];
      out.unshift(L[row]);
      if (k < 8 || k === n - 2) r.snap(`沿 LF 往回：讀到「${L[row]}」，目前還原「${out.join('')}」`, [table([[...F], [...L]], { [`1,${row}`]: 'active', [`0,${row}`]: 'compare' }, { rowHeaders: ['F', 'L'], colHeaders: Array.from({ length: n }, (_, i) => i) }), vars({ 還原: out.join('') })], 6);
    }
    r.snap(`還原結果「${out.join('')}」${out.join('') === S0 ? '與原字串相同' : '與原字串不同！'}`, [vars({ BWT: L, 還原: out.join('') }, undefined, { 還原: 'done' })], 6);
    return r.frames;
  },
};

// ---------------- Move-to-Front ----------------
const mtf: AlgoDef = {
  id: 'move-to-front', name: '移至前端轉換', en: 'Move-to-Front Transform', cat,
  desc: '維護一個字母表串列，每讀入一個字元就輸出它目前的位置，再把它移到最前面。剛出現過的字元位置很小，因此像 BWT 輸出這種「相同字元聚在一起」的資料會變成大量的 0 與小數字，後續的熵編碼就能壓得更好。解碼時用同樣的初始串列，依位置取字元並同樣移到前面。',
  time: 'O(n · σ)', space: 'O(σ)',
  code: ['list = 初始字母表（a..z）', 'for c in text:', '  i = list.indexOf(c)；輸出 i', '  把 c 從 list 移到最前面', '解碼：for i in codes: c = list[i]；輸出 c；把 c 移到最前面'],
  inputs: [inText('s', '文字（小寫字母）', 'bananaaa', () => rnd.pick(['bananaaa', 'annb', 'aaabbbccc', 'abcabcabc']))],
  run({ s }) {
    const r = new Rec();
    const S = short(String(s), 30);
    if (!/^[a-z]*$/.test(S)) throw new Error('只接受小寫英文字母');
    const list = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const codes: number[] = [];
    r.snap('初始字母表', [cells(list.slice(0, 12).concat(['…']), {}, { title: '字母表（前 12 個）' })], 1);
    for (const c of S) {
      const i = list.indexOf(c);
      codes.push(i);
      r.snap(`「${c}」目前在位置 ${i}，輸出 ${i}`, [cells(list.slice(0, 12).concat(['…']), { [i]: 'active' }, { title: '字母表（前 12 個）' }), cells(codes, { [codes.length - 1]: 'done' }, { title: '輸出' })], 3);
      list.splice(i, 1);
      list.unshift(c);
      r.snap(`把「${c}」移到最前面`, [cells(list.slice(0, 12).concat(['…']), { 0: 'swap' }, { title: '字母表（前 12 個）' }), cells(codes, {}, { title: '輸出' })], 4);
    }
    const dl = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const dec = codes.map((i) => { const c = dl[i]; dl.splice(i, 1); dl.unshift(c); return c; }).join('');
    r.snap(`編碼結果 ${codes.join(' ')}；解碼還原「${dec}」${dec === S ? '，往返成功' : '，不一致！'}`, [bars(codes.length ? codes : [0], {}, { title: '輸出（小數字越多越好壓縮）' }), vars({ 編碼: codes.join(' '), 解碼: dec })], 5);
    return r.frames;
  },
};

// ---------------- FM 索引 ----------------
const fmIndex: AlgoDef = {
  id: 'fm-index', name: 'FM 索引', en: 'FM-index', cat,
  desc: '以 BWT 為基礎的全文索引。C[c] 是比 c 小的字元總數，Occ(c, i) 是 L[0..i) 中 c 的個數。向後搜尋從模式的最後一個字元開始，維護後綴陣列中的區間 [sp, ep)：每往前讀一個字元 c，sp = C[c] + Occ(c, sp)、ep = C[c] + Occ(c, ep)。最後區間長度就是出現次數，搭配後綴陣列可以列出位置。',
  time: '建構 O(n log n)，查詢 O(m)', space: 'O(n · σ)（可壓縮）',
  code: ['L = BWT(text + "$")，SA = 後綴陣列', 'C[c] = 比 c 小的字元個數', 'Occ(c, i) = L[0..i) 中 c 的個數（前綴計數）', 'sp = 0, ep = n', 'for c in reversed(pattern):', '  sp = C[c] + Occ(c, sp)；ep = C[c] + Occ(c, ep)', '  若 sp ≥ ep：不存在', 'count = ep − sp；位置 = SA[sp..ep)'],
  inputs: [inText('text', '文字（≤ 16 字元）', 'abracadabra', () => rnd.pick(['abracadabra', 'mississippi', 'banana', 'acgtacgtgacg'])), inText('pat', '模式', 'abra', () => rnd.pick(['a', 'abra', 'ssi', 'ana', 'acg', 'xyz']))],
  run({ text: t, pat }) {
    const r = new Rec();
    const T0 = short(String(t), 16, '文字');
    if (T0.includes('$')) throw new Error('文字不可含 $');
    const P = String(pat);
    if (!P) throw new Error('模式不可為空');
    const T = T0 + '$', n = T.length;
    const SA = Array.from({ length: n }, (_, i) => i).sort((a, b) => (T.slice(a) < T.slice(b) ? -1 : 1));
    const L = SA.map((i) => T[(i + n - 1) % n]);
    const alpha = [...new Set(T)].sort();
    const C: Record<string, number> = {};
    let acc = 0;
    for (const c of alpha) { C[c] = acc; acc += T.split('').filter((x) => x === c).length; }
    const occ = (c: string, i: number) => L.slice(0, i).filter((x) => x === c).length;
    const occTab = alpha.map((c) => Array.from({ length: n + 1 }, (_, i) => occ(c, i)));
    const base = (sp: number, ep: number) => [table(SA.map((i, k) => [k, i, T.slice(i), L[k]]), Object.fromEntries(SA.flatMap((_, k) => (k >= sp && k < ep ? [[`${k},2`, 'active' as Color]] : []))), { colHeaders: ['列', 'SA', '後綴', 'L'], w: 'half' }), table(occTab, {}, { rowHeaders: alpha.map((c) => `Occ(${c},·) C=${C[c]}`), colHeaders: Array.from({ length: n + 1 }, (_, i) => i), title: 'Occ(c, i)', w: 'half' })];
    r.snap(`建出後綴陣列與 BWT：L = ${L.join('')}`, base(0, 0), 3);
    let sp = 0, ep = n;
    for (let k = P.length - 1; k >= 0; k--) {
      const c = P[k];
      if (C[c] === undefined) { sp = ep = 0; r.snap(`「${c}」不在文字中，模式不存在`, base(0, 0), 7); break; }
      const nsp = C[c] + occ(c, sp), nep = C[c] + occ(c, ep);
      r.snap(`讀「${c}」：sp = C[${c}] + Occ(${c}, ${sp}) = ${C[c]} + ${occ(c, sp)} = ${nsp}，ep = ${C[c]} + ${occ(c, ep)} = ${nep}；目前匹配「${P.slice(k)}」`, base(nsp, nep), 6);
      sp = nsp; ep = nep;
      if (sp >= ep) { r.snap(`區間為空：「${P.slice(k)}」不存在`, base(0, 0), 7); break; }
    }
    const cnt = Math.max(0, ep - sp);
    const pos = SA.slice(sp, ep).sort((a, b) => a - b);
    const brute: number[] = [];
    for (let i = 0; i + P.length <= T0.length; i++) if (T0.slice(i, i + P.length) === P) brute.push(i);
    r.snap(`出現 ${cnt} 次，位置 ${pos.join(', ') || '無'}；暴力比對 ${brute.length} 次${brute.join() === pos.join() ? '，一致' : '，不一致！'}`, [cells(T0.split(''), Object.fromEntries(pos.flatMap((p) => Array.from({ length: P.length }, (_, k) => [p + k, 'done' as Color]))))], 8);
    return r.frames;
  },
};

// ---------------- 正規 Huffman 編碼 ----------------
const canonical: AlgoDef = {
  id: 'canonical-huffman', name: '正規 Huffman 編碼', en: 'Canonical Huffman Coding', cat,
  desc: '一般 Huffman 編碼只有碼長是最佳的，0/1 的分配可以任意交換。正規形式只保留每個符號的碼長：依（碼長, 符號）排序後，第一個碼全為 0，之後每個碼是前一個加 1，碼長變長時再左移補 0。解碼端只要收到碼長表就能重建同一套碼字，DEFLATE（zip、PNG）就是這樣傳碼表的。',
  time: 'O(σ log σ)', space: 'O(σ)',
  code: ['用 Huffman 演算法求每個符號的碼長', '依（碼長, 符號）排序', 'code = 0，prevLen = 第一個碼長', 'for 每個符號：', '  code <<= (len − prevLen)；prevLen = len', '  指定 code（len 位元），code += 1', '檢查前綴性質並編碼／解碼驗證'],
  inputs: [inText('s', '文字', 'abracadabra alakazam', () => rnd.pick(['abracadabra', 'mississippi river', 'this is an example', 'aaaabbbccd']))],
  run({ s }) {
    const r = new Rec();
    const S = short(String(s), 60);
    if (!S) throw new Error('請輸入文字');
    const freq: Record<string, number> = {};
    for (const c of S) freq[c] = (freq[c] ?? 0) + 1;
    const syms = Object.keys(freq).sort();
    const lens: Record<string, number> = {};
    if (syms.length === 1) lens[syms[0]] = 1;
    else {
      // 以穩定規則合併：頻率小者優先，平手時以建立順序決定
      let nodes = syms.map((c, i) => ({ w: freq[c], ord: i, leaves: [c] }));
      let ord = syms.length;
      while (nodes.length > 1) {
        nodes.sort((a, b) => a.w - b.w || a.ord - b.ord);
        const [a, b] = nodes;
        for (const c of [...a.leaves, ...b.leaves]) lens[c] = (lens[c] ?? 0) + 1;
        nodes = [{ w: a.w + b.w, ord: ord++, leaves: [...a.leaves, ...b.leaves] }, ...nodes.slice(2)];
      }
    }
    const disp = (c: string) => (c === ' ' ? '␣' : c);
    r.snap('Huffman 只需要決定每個符號的碼長', [table(syms.map((c) => [disp(c), freq[c], lens[c]]), {}, { colHeaders: ['符號', '次數', '碼長'] })], 1);
    const order = [...syms].sort((a, b) => lens[a] - lens[b] || (a < b ? -1 : 1));
    const codes: Record<string, string> = {};
    let code = 0, prev = lens[order[0]];
    const rows: (string | number)[][] = [];
    order.forEach((c, k) => {
      code <<= lens[c] - prev;
      prev = lens[c];
      codes[c] = code.toString(2).padStart(lens[c], '0');
      rows.push([disp(c), lens[c], codes[c]]);
      r.snap(`「${disp(c)}」碼長 ${lens[c]}：碼字 ${codes[c]}` + (k ? '（前一個碼 + 1，必要時左移補 0）' : '（第一個碼全為 0）'), [table(rows, { [`${k},2`]: 'done' }, { colHeaders: ['符號', '碼長', '正規碼字'] })], 5);
      code++;
    });
    const all = Object.values(codes);
    const prefixFree = all.every((x, i) => all.every((y, j) => i === j || !y.startsWith(x)));
    const enc = [...S].map((c) => codes[c]).join('');
    const rev = Object.fromEntries(Object.entries(codes).map(([c, b]) => [b, c]));
    let dec = '', buf = '';
    for (const b of enc) { buf += b; if (rev[buf] !== undefined) { dec += rev[buf]; buf = ''; } }
    r.snap(`前綴性質：${prefixFree ? '成立' : '不成立！'}；編碼共 ${enc.length} 位元（固定長度需 ${S.length * Math.max(1, Math.ceil(Math.log2(syms.length)))}），解碼${dec === S ? '還原成功' : '失敗！'}`, [text([enc.length > 120 ? enc.slice(0, 120) + '…' : enc], '編碼結果'), vars({ 位元數: enc.length, 解碼: dec === S ? '成功' : '失敗' }, undefined, { 解碼: dec === S ? 'done' : 'bad' })], 7);
    return r.frames;
  },
};

export default [samDef, ukkonen, eertree, shiftAnd, thompsonDef, subsetDef, hopcroftDef, bwt, mtf, fmIndex, canonical] satisfies AlgoDef[];
