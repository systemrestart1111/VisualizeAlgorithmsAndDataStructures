import type { AlgoDef, Color, GEdge, GNode } from '../core/types';
import { Rec, cells, vars, table, text, inText, inNum, rnd } from '../core/helpers';
import { layoutTree } from '../core/graph';

const cat = 'string';
type CM = Record<string, Color | undefined>;

const textIn = (def = 'ABABDABACDABABCABAB') => inText('t', '文字 T', def, () => rnd.pick(['AABAACAADAABAABA', 'THIS IS A TEST TEXT', 'ABCABCABDABCABCD', 'GCATCGCAGAGAGTATACAGTACG']));
const patIn = (def = 'ABABCABAB') => inText('p', '樣式 P', def, () => rnd.pick(['AABA', 'TEST', 'ABCABD', 'GCAGAGAG']));

/** 文字與樣式對齊顯示：第一列文字，第二列把樣式放在 shift 位置 */
function align(T: string, P: string, shift: number, colors: Record<number, Color | undefined> = {}, found: number[] = []) {
  const n = T.length;
  const row2 = Array.from({ length: n }, (_, i) => (i >= shift && i < shift + P.length ? P[i - shift] : ''));
  const c: CM = {};
  for (const f of found) for (let k = 0; k < P.length; k++) c[`0,${f + k}`] = 'done';
  for (const [k, v] of Object.entries(colors)) { c[`0,${k}`] = v; c[`1,${k}`] = v; }
  return table([T.split(''), row2], c, { rowHeaders: ['T', 'P'], colHeaders: Array.from({ length: n }, (_, i) => i) });
}

const naive: AlgoDef = {
  id: 'naive-match', name: '暴力字串匹配', en: 'Naive String Matching', cat, star: true,
  desc: '把樣式依序對齊文字的每個位置，逐字比對；遇到不相符就把樣式右移一格重新比對。',
  time: 'O(n · m)', space: 'O(1)',
  code: ['for s = 0 .. n-m:', '  j = 0', '  while j < m and T[s+j] == P[j]: j++', '  if j == m: 在 s 找到', '  （不相符則 s+1 重新比對）'],
  inputs: [textIn('AABAACAADAABAABA'), patIn('AABA')],
  run({ t, p }) {
    const r = new Rec();
    const found: number[] = [];
    let cmp = 0;
    for (let s = 0; s + p.length <= t.length; s++) {
      let j = 0;
      while (j < p.length) {
        cmp++;
        const ok = t[s + j] === p[j];
        r.snap(`位移 ${s}：比較 T[${s + j}]='${t[s + j]}' 與 P[${j}]='${p[j]}' → ${ok ? '相符' : '不符'}`, [align(t, p, s, { ...Object.fromEntries(Array.from({ length: j }, (_, k) => [s + k, 'good'])), [s + j]: ok ? 'good' : 'bad' }, found), vars({ 比較次數: cmp })], 3);
        if (!ok) break;
        j++;
      }
      if (j === p.length) { found.push(s); r.snap(`在位置 ${s} 找到！`, [align(t, p, s, {}, found), vars({ 比較次數: cmp })], 4); }
    }
    r.snap(`完成，出現位置：${found.join(', ') || '無'}`, [align(t, p, -100, {}, found), vars({ 比較次數: cmp })]);
    return r.frames;
  },
};

export function failure(p: string) {
  const f = new Array(p.length).fill(0);
  for (let i = 1, k = 0; i < p.length; i++) {
    while (k && p[i] !== p[k]) k = f[k - 1];
    if (p[i] === p[k]) k++;
    f[i] = k;
  }
  return f;
}

const kmp: AlgoDef = {
  id: 'kmp', name: 'KMP 字串匹配', en: 'Knuth–Morris–Pratt', cat, star: true,
  desc: '先建立失敗函數 π[i] = P[0..i] 的最長真前綴＝後綴長度。比對失敗時，不必回退文字指標，而是把樣式指標跳到 π[j−1]，利用已比對過的資訊。',
  time: 'O(n + m)', space: 'O(m)',
  code: ['建表：π[0] = 0, k = 0', '  for i = 1 .. m-1:', '    while k > 0 and P[i] != P[k]: k = π[k-1]', '    if P[i] == P[k]: k++', '    π[i] = k', '搜尋：j = 0', '  for i = 0 .. n-1:', '    while j > 0 and T[i] != P[j]: j = π[j-1]', '    if T[i] == P[j]: j++', '    if j == m: 找到 i-m+1; j = π[j-1]'],
  inputs: [textIn(), patIn()],
  run({ t, p }) {
    const r = new Rec();
    const m = p.length;
    const f: (number | null)[] = new Array(m).fill(null);
    f[0] = 0;
    const PT = (c: Record<number, Color> = {}, i?: number, k?: number) => table([p.split(''), f], Object.fromEntries(Object.entries(c).flatMap(([x, v]) => [[`0,${x}`, v], [`1,${x}`, v]])) as CM, { rowHeaders: ['P', 'π'], colHeaders: Array.from({ length: m }, (_, x) => x), title: '失敗函數 π' + (i !== undefined ? `（i = ${i}, k = ${k}）` : ''), w: 'half' });
    r.snap('π[0] = 0', [PT({ 0: 'done' })], 1);
    for (let i = 1, k = 0; i < m; i++) {
      while (k && p[i] !== p[k]) { r.snap(`P[${i}]='${p[i]}' ≠ P[${k}]='${p[k]}'，k = π[${k - 1}] = ${f[k - 1]}`, [PT({ [i]: 'bad', [k]: 'bad' }, i, k)], 3); k = f[k - 1]!; }
      if (p[i] === p[k]) k++;
      f[i] = k;
      r.snap(`π[${i}] = ${k}`, [PT({ [i]: 'swap', ...(k ? { [k - 1]: 'good' } : {}) }, i, k)], 5);
    }
    const found: number[] = [];
    let j = 0, cmp = 0;
    for (let i = 0; i < t.length; i++) {
      while (j && t[i] !== p[j]) {
        cmp++;
        r.snap(`T[${i}]='${t[i]}' ≠ P[${j}]='${p[j]}'：樣式跳到 π[${j - 1}] = ${f[j - 1]}（文字指標不回退）`, [align(t, p, i - j, { [i]: 'bad' }, found), PT({ [j - 1]: 'compare' }), vars({ i, j, 比較次數: cmp })], 8);
        j = f[j - 1]!;
      }
      cmp++;
      if (t[i] === p[j]) { j++; r.snap(`T[${i}] = P[${j - 1}] = '${t[i]}'，j = ${j}`, [align(t, p, i - j + 1, Object.fromEntries(Array.from({ length: j }, (_, k) => [i - j + 1 + k, 'good'])), found), PT(), vars({ i, j, 比較次數: cmp })], 9); }
      else r.snap(`T[${i}]='${t[i]}' ≠ P[0]，前進`, [align(t, p, i, { [i]: 'bad' }, found), PT(), vars({ i, j, 比較次數: cmp })], 9);
      if (j === m) { found.push(i - m + 1); r.snap(`找到位置 ${i - m + 1}！j = π[${m - 1}] = ${f[m - 1]}`, [align(t, p, i - m + 1, {}, found), PT(), vars({ i, j, 比較次數: cmp })], 10); j = f[m - 1]!; }
    }
    r.snap(`完成，出現位置：${found.join(', ') || '無'}`, [align(t, p, -100, {}, found), PT(), vars({ 比較次數: cmp })]);
    return r.frames;
  },
};

const rabin: AlgoDef = {
  id: 'rabin-karp', name: '拉賓–卡普字串匹配', en: 'Rabin–Karp', cat,
  desc: '把樣式與文字中每個長度 m 的視窗轉成雜湊值比較；視窗滑動時以 O(1) 的滾動雜湊更新。雜湊相同才逐字確認（可能是假陽性碰撞）。',
  time: '平均 O(n + m)，最差 O(n · m)', space: 'O(1)',
  code: ['hp = hash(P), ht = hash(T[0..m-1])', 'for s = 0 .. n-m:', '  if ht == hp:', '    逐字確認，相同則找到', '  ht = (ht - T[s]·B^(m-1)) · B + T[s+m]  (mod q)'],
  inputs: [textIn('31415926535897932384626'), patIn('26'), inNum('q', '模數 q（小一點容易看到碰撞）', 13, 2, 1000003)],
  run({ t, p, q }) {
    const r = new Rec();
    const B = 10, m = p.length, n = t.length;
    const code = (c: string) => (/\d/.test(c) ? +c : c.charCodeAt(0));
    let h = 1;
    for (let i = 1; i < m; i++) h = (h * B) % q;
    let hp = 0, ht = 0;
    for (let i = 0; i < m; i++) { hp = (hp * B + code(p[i])) % q; ht = (ht * B + code(t[i])) % q; }
    const found: number[] = [];
    let spurious = 0;
    for (let s = 0; s + m <= n; s++) {
      const win: Record<number, Color> = Object.fromEntries(Array.from({ length: m }, (_, k) => [s + k, 'active' as Color]));
      if (ht === hp) {
        const ok = t.slice(s, s + m) === p;
        if (ok) found.push(s); else spurious++;
        r.snap(ok ? `位移 ${s}：雜湊相同 (${ht})，逐字確認相同 → 找到！` : `位移 ${s}：雜湊相同 (${ht}) 但字串不同 → 假陽性碰撞`, [align(t, p, s, Object.fromEntries(Array.from({ length: m }, (_, k) => [s + k, ok ? 'good' : 'bad'])), found), vars({ 'hash(P)': hp, '視窗 hash': ht, 假陽性: spurious })], 4);
      } else r.snap(`位移 ${s}：視窗 hash ${ht} ≠ ${hp}，跳過`, [align(t, p, s, win, found), vars({ 'hash(P)': hp, '視窗 hash': ht, 假陽性: spurious })], 3);
      if (s + m < n) ht = (((ht - code(t[s]) * h) % q + q) * B + code(t[s + m])) % q;
    }
    r.snap(`完成，出現位置：${found.join(', ') || '無'}（假陽性 ${spurious} 次）`, [align(t, p, -100, {}, found)], 5);
    return r.frames;
  },
};

const boyerMoore: AlgoDef = {
  id: 'boyer-moore', name: '博耶–摩爾字串匹配', en: 'Boyer–Moore (Bad Character + Good Suffix)', cat,
  desc: '由右往左比對樣式。不相符時取兩個規則中較大的位移：壞字元規則（把文字中的不符字元對齊到樣式中它最後出現的位置）與好後綴規則（把已比對成功的後綴對齊到它在樣式中的另一次出現）。',
  time: '最佳 O(n/m)，最差 O(n · m)', space: 'O(m + σ)',
  code: ['預處理 last[c]、goodSuffix[j]', 's = 0', 'while s <= n - m:', '  j = m - 1', '  while j >= 0 and P[j] == T[s+j]: j--', '  if j < 0: 找到 s; s += goodSuffix[0]', '  else: s += max(j - last[T[s+j]], goodSuffix[j+1])'],
  inputs: [textIn('HERE IS A SIMPLE EXAMPLE'), patIn('EXAMPLE')],
  run({ t, p }) {
    const r = new Rec();
    const m = p.length, n = t.length;
    const last: Record<string, number> = {};
    for (let i = 0; i < m; i++) last[p[i]] = i;
    // 強好後綴表
    const shift = new Array(m + 1).fill(0), bpos = new Array(m + 1).fill(0);
    let i = m, j = m + 1;
    bpos[i] = j;
    while (i > 0) { while (j <= m && p[i - 1] !== p[j - 1]) { if (!shift[j]) shift[j] = j - i; j = bpos[j]; } i--; j--; bpos[i] = j; }
    j = bpos[0];
    for (i = 0; i <= m; i++) { if (!shift[i]) shift[i] = j; if (i === j) j = bpos[j]; }
    const tbl = table([Object.keys(last), Object.values(last)], {}, { rowHeaders: ['字元', 'last'], title: '壞字元表', w: 'half' });
    const gs = table([shift.slice(1).concat([]), p.split('')], {}, { rowHeaders: ['好後綴位移', 'P'], colHeaders: Array.from({ length: m }, (_, k) => `j=${k}`), title: '好後綴表（不符位置 j 時用 shift[j+1]）', w: 'half' });
    const found: number[] = [];
    let s = 0, cmp = 0;
    r.snap('預處理完成', [align(t, p, 0), tbl, gs], 1);
    while (s <= n - m) {
      let k = m - 1;
      const ok: Record<number, Color> = {};
      while (k >= 0) {
        cmp++;
        const eq = p[k] === t[s + k];
        r.snap(`位移 ${s}：由右往左比較 P[${k}]='${p[k]}' 與 T[${s + k}]='${t[s + k]}'`, [align(t, p, s, { ...ok, [s + k]: eq ? 'good' : 'bad' }, found), tbl, gs, vars({ 比較次數: cmp })], 5);
        if (!eq) break;
        ok[s + k] = 'good';
        k--;
      }
      if (k < 0) { found.push(s); r.snap(`在 ${s} 找到！位移 ${shift[0]}`, [align(t, p, s, ok, found), tbl, gs, vars({ 比較次數: cmp })], 6); s += shift[0]; }
      else {
        const bc = k - (last[t[s + k]] ?? -1), gsv = shift[k + 1];
        const d = Math.max(1, bc, gsv);
        r.snap(`壞字元 '${t[s + k]}' 建議位移 ${bc}，好後綴建議 ${gsv} → 位移 ${d}`, [align(t, p, s, { ...ok, [s + k]: 'bad' }, found), tbl, gs, vars({ 比較次數: cmp })], 7);
        s += d;
      }
    }
    r.snap(`完成，出現位置：${found.join(', ') || '無'}，共比較 ${cmp} 次`, [align(t, p, -100, {}, found), tbl, gs]);
    return r.frames;
  },
};

const horspool: AlgoDef = {
  id: 'horspool', name: '霍斯普爾字串匹配', en: 'Boyer–Moore–Horspool', cat,
  desc: 'Boyer–Moore 的簡化版：只用一張位移表，依「目前視窗最右端的文字字元」決定位移量 shift[c] = m − 1 − (c 在 P[0..m−2] 中最後出現的位置)。實作簡單、實務上很快。',
  time: '平均 O(n)，最差 O(n · m)', space: 'O(σ)',
  code: ['shift[c] = m（預設）', 'for i = 0 .. m-2: shift[P[i]] = m - 1 - i', 's = 0', 'while s <= n - m:', '  由右往左比對，全部相同則找到', '  s += shift[T[s + m - 1]]'],
  inputs: [textIn('JIM SAW ME IN A BARBERSHOP'), patIn('BARBER')],
  run({ t, p }) {
    const r = new Rec();
    const m = p.length, n = t.length;
    const sh: Record<string, number> = {};
    for (let i = 0; i < m - 1; i++) sh[p[i]] = m - 1 - i;
    const tbl = table([[...Object.keys(sh), '其他'], [...Object.values(sh), m]], {}, { rowHeaders: ['字元', 'shift'], title: '位移表' });
    const found: number[] = [];
    let s = 0, cmp = 0;
    r.snap('建立位移表', [align(t, p, 0), tbl], 2);
    while (s <= n - m) {
      let k = m - 1;
      const ok: Record<number, Color> = {};
      while (k >= 0 && (cmp++, p[k] === t[s + k])) { ok[s + k] = 'good'; k--; }
      if (k < 0) found.push(s);
      else ok[s + k] = 'bad';
      const c = t[s + m - 1];
      const d = sh[c] ?? m;
      r.snap(`${k < 0 ? `在 ${s} 找到！` : `位移 ${s} 不符；`}視窗最右字元 '${c}' → 位移 ${d}`, [align(t, p, s, { ...ok, [s + m - 1]: ok[s + m - 1] ?? 'compare' }, found), tbl, vars({ 比較次數: cmp })], 6);
      s += d;
    }
    r.snap(`完成，出現位置：${found.join(', ') || '無'}`, [align(t, p, -100, {}, found), tbl]);
    return r.frames;
  },
};

const zalg: AlgoDef = {
  id: 'z-algorithm', name: 'Z 函數字串匹配', en: 'Z Algorithm', cat,
  desc: 'Z[i] = 從 i 開始的子字串與整個字串的最長共同前綴長度。維護最右的匹配區間 [l, r)，在區間內可直接沿用 Z[i − l]。把 P + "$" + T 算 Z 陣列即可做字串匹配。',
  time: 'O(n)', space: 'O(n)',
  code: ['l = r = 0', 'for i = 1 .. n-1:', '  if i < r: z[i] = min(r - i, z[i - l])', '  while i + z[i] < n and s[z[i]] == s[i + z[i]]: z[i]++', '  if i + z[i] > r: l = i, r = i + z[i]', '匹配：z[i] == |P| 的位置即為出現處'],
  inputs: [inText('s', '字串（可用 P$T 做匹配）', 'aab$baabaaab', () => rnd.pick(['aabxaabxcaabxaabxay', 'abc$xabcabzabc', 'aaaaa', 'abacaba']))],
  run({ s }) {
    const r = new Rec();
    const n = s.length;
    const z: (number | null)[] = new Array(n).fill(null);
    z[0] = n;
    let l = 0, rr = 0;
    const P = (i: number, c: CM = {}) => table([s.split(''), z], { ...Object.fromEntries(Array.from({ length: Math.max(0, rr - l) }, (_, k) => [`0,${l + k}`, 'frontier' as Color])), ...c }, { rowHeaders: ['s', 'Z'], colHeaders: Array.from({ length: n }, (_, k) => k), title: `青色為目前的 Z-box [${l}, ${rr})` });
    for (let i = 1; i < n; i++) {
      let zi = 0;
      if (i < rr) { zi = Math.min(rr - i, z[i - l]!); r.snap(`i = ${i} 在 Z-box 內，先沿用 min(r−i, Z[${i - l}]) = ${zi}`, [P(i, { [`1,${i - l}`]: 'compare', [`1,${i}`]: 'active' }), vars({ l, r: rr })], 3); }
      while (i + zi < n && s[zi] === s[i + zi]) zi++;
      z[i] = zi;
      if (i + zi > rr) { l = i; rr = i + zi; }
      r.snap(`Z[${i}] = ${zi}`, [P(i, { [`1,${i}`]: 'swap', ...Object.fromEntries(Array.from({ length: zi }, (_, k) => [`0,${i + k}`, 'good' as Color])), ...Object.fromEntries(Array.from({ length: zi }, (_, k) => [`0,${k}`, 'active' as Color])) }), vars({ l, r: rr })], 5);
    }
    const sep = s.indexOf('$');
    const hits = sep > 0 ? z.map((v, i) => (i > sep && v === sep ? i - sep - 1 : -1)).filter((x) => x >= 0) : [];
    r.snap(sep > 0 ? `Z[i] = |P| = ${sep} 的位置對應 T 中的出現：${hits.join(', ') || '無'}` : 'Z 陣列完成', [P(-1, Object.fromEntries(z.map((v, i) => [`1,${i}`, sep > 0 && i > sep && v === sep ? 'done' : undefined])) as CM)], 6);
    return r.frames;
  },
};

const aho: AlgoDef = {
  id: 'aho-corasick', name: 'AC 自動機多模式匹配', en: 'Aho–Corasick', cat,
  desc: '同時搜尋多個樣式：先把所有樣式建成 Trie，再用 BFS 建立失敗指標（類似 KMP 的 π 推廣到樹上）。掃描文字時沿 Trie 走，失配就跟著失敗指標跳，並收集輸出連結上的所有樣式。',
  time: 'O(n + Σ|P| + 出現次數)', space: 'O(Σ|P| · σ)',
  code: ['把所有樣式插入 Trie', 'BFS 建立失敗指標：', '  fail[child] = 沿 fail[parent] 找到有相同字元的子節點', 'state = root', 'for c in T:', '  while state 沒有 c 子節點且非 root: state = fail[state]', '  state = goto(state, c)', '  輸出 state 與其失敗鏈上所有結尾的樣式'],
  inputs: [inText('pats', '樣式（空白分隔）', 'he she his hers', () => rnd.pick(['a ab bab bc bca c caa', 'he she his hers', 'cat at tac'])), inText('t', '文字', 'ushershishe', () => rnd.pick(['ushers', 'abccab', 'catatac']))],
  run({ pats, t }) {
    const r = new Rec();
    const P = String(pats).trim().split(/\s+/);
    const go: Record<string, string>[] = [{}];
    const label: string[] = ['root'];
    const out: string[][] = [[]];
    const fail: number[] = [0];
    for (const p of P) {
      let s = 0;
      for (const c of p) {
        if (go[s][c] === undefined) { go.push({}); label.push(c); out.push([]); fail.push(0); go[s][c] = String(go.length - 1); }
        s = +go[s][c];
      }
      out[s].push(p);
    }
    const children: Record<string, string[]> = {};
    go.forEach((g, i) => (children['s' + i] = Object.values(g).map((x) => 's' + x)));
    const pos = layoutTree('s0', children, 48, 60);
    const panel = (o: { cur?: number; showFail?: boolean; hl?: Set<number> } = {}) => {
      const nodes: GNode[] = go.map((_, i) => ({ id: 's' + i, x: pos['s' + i].x, y: pos['s' + i].y, label: label[i], color: i === o.cur ? 'active' : o.hl?.has(i) ? 'compare' : out[i].length ? 'done' : undefined, sub: out[i].length ? out[i].join(',') : undefined, r: 16 }));
      const edges: GEdge[] = [];
      go.forEach((g, i) => Object.values(g).forEach((x) => edges.push({ from: 's' + i, to: 's' + x })));
      if (o.showFail) fail.forEach((f, i) => { if (i && f) edges.push({ from: 's' + i, to: 's' + f, dashed: true, color: 'special', directed: true, curve: 12 }); });
      return { type: 'graph' as const, nodes, edges, title: 'Trie（綠：樣式結尾；粉紅虛線：失敗指標，指向根的省略）' };
    };
    r.snap(`把 ${P.length} 個樣式插入 Trie`, [panel()], 1);
    const q: number[] = Object.values(go[0]).map(Number);
    while (q.length) {
      const u = q.shift()!;
      for (const [c, vs] of Object.entries(go[u])) {
        const v = +vs;
        let f = fail[u];
        while (f && go[f][c] === undefined) f = fail[f];
        fail[v] = go[f][c] !== undefined && +go[f][c] !== v ? +go[f][c] : 0;
        out[v] = [...out[v], ...out[fail[v]].filter((x) => !out[v].includes(x))];
        q.push(v);
        r.snap(`fail(${label[v]}@${v}) = ${fail[v] ? label[fail[v]] + '@' + fail[v] : 'root'}`, [panel({ cur: v, showFail: true, hl: new Set([fail[v]]) })], 3);
      }
    }
    let s = 0;
    const found: string[] = [];
    const tc: Record<number, Color> = {};
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      while (s && go[s][c] === undefined) { r.snap(`狀態 ${s} 沒有 '${c}' 邊，沿失敗指標跳到 ${fail[s]}`, [panel({ cur: s, showFail: true, hl: new Set([fail[s]]) }), cells(t.split(''), { ...tc, [i]: 'bad' }, { title: '文字' }), text(found, '找到')], 6); s = fail[s]; }
      s = go[s][c] !== undefined ? +go[s][c] : 0;
      tc[i] = 'visited';
      const hits = out[s];
      for (const h of hits) { found.push(`"${h}" @ ${i - h.length + 1}`); for (let k = i - h.length + 1; k <= i; k++) tc[k] = 'done'; }
      r.snap(`讀入 '${c}' → 狀態 ${s}${hits.length ? `，輸出 ${hits.join(', ')}` : ''}`, [panel({ cur: s, showFail: true }), cells(t.split(''), { ...tc, [i]: hits.length ? 'done' : 'active' }, { title: '文字' }), text(found, '找到')], hits.length ? 8 : 7);
    }
    r.snap(`共找到 ${found.length} 次出現`, [panel({ showFail: true }), cells(t.split(''), tc, { title: '文字' }), text(found, '找到')]);
    return r.frames;
  },
};

const manacher: AlgoDef = {
  id: 'manacher', name: '曼納徹最長回文', en: "Manacher's Algorithm", cat,
  desc: '線性時間求最長回文子字串：先在字元間插入 # 統一奇偶長度，維護最右回文的中心 c 與右界 r；i 在 r 內時可利用對稱點 2c − i 的半徑作為起點，再向外擴展。',
  time: 'O(n)', space: 'O(n)',
  code: ['s = "#" + 字元間插入 "#" + "#"', 'c = r = 0', 'for i in s:', '  if i < r: p[i] = min(r - i, p[2c - i])', '  while s[i - p[i] - 1] == s[i + p[i] + 1]: p[i]++', '  if i + p[i] > r: c = i, r = i + p[i]', '最長回文 = max p[i]'],
  inputs: [inText('s', '字串', 'babcbabcbaccba', () => rnd.pick(['forgeeksskeegfor', 'abacdfgdcaba', 'cbbd', 'racecarxyz']))],
  run({ s }) {
    const r = new Rec();
    const T = ['^', '#', ...s.split('').flatMap((c: string) => [c, '#']), '$'];
    const n = T.length;
    const p: (number | null)[] = new Array(n).fill(null);
    let c = 0, rr = 0, best = 0, bc = 0;
    const P = (i: number, hl: CM = {}) => table([T, p], { ...Object.fromEntries(Array.from({ length: Math.max(0, 2 * (rr - c) + 1) }, (_, k) => [`0,${c - (rr - c) + k}`, 'frontier' as Color])), ...hl }, { rowHeaders: ['s', 'p'], colHeaders: Array.from({ length: n }, (_, k) => k), title: `青色：目前最右回文（中心 ${c}、右界 ${rr}）` });
    for (let i = 1; i < n - 1; i++) {
      let pi = 0;
      if (i < rr) { pi = Math.min(rr - i, p[2 * c - i]!); r.snap(`i = ${i} < r：鏡像位置 ${2 * c - i} 的半徑 ${p[2 * c - i]}，取 ${pi} 為起點`, [P(i, { [`1,${2 * c - i}`]: 'compare', [`0,${i}`]: 'active' }), vars({ c, r: rr, best })], 4); }
      while (T[i - pi - 1] === T[i + pi + 1]) pi++;
      p[i] = pi;
      if (i + pi > rr) { c = i; rr = i + pi; }
      if (pi > best) { best = pi; bc = i; }
      r.snap(`p[${i}] = ${pi}`, [P(i, { [`1,${i}`]: 'swap', ...Object.fromEntries(Array.from({ length: 2 * pi + 1 }, (_, k) => [`0,${i - pi + k}`, 'good' as Color])) }), vars({ c, r: rr, best })], 5);
    }
    const start = (bc - best - 1) >> 1;
    const ans = s.slice(start, start + best);
    r.snap(`最長回文子字串："${ans}"（長度 ${best}）`, [P(-1, Object.fromEntries(Array.from({ length: 2 * best + 1 }, (_, k) => [`0,${bc - best + k}`, 'done' as Color]))), cells(s.split(''), Object.fromEntries(Array.from({ length: best }, (_, k) => [start + k, 'done'])), { title: '原字串' })], 7);
    return r.frames;
  },
};

const rolling: AlgoDef = {
  id: 'rolling-hash', name: '滾動雜湊', en: 'Rolling Hash (Polynomial Prefix Hash)', cat,
  desc: '預先計算前綴雜湊 H[i] 與 B 的冪次，任意子字串 s[l..r) 的雜湊 = H[r] − H[l]·B^(r−l)（mod M）可 O(1) 取得。此處用它找出所有長度 L 的重複子字串。',
  time: '預處理 O(n)，查詢 O(1)', space: 'O(n)',
  code: ['H[0] = 0; H[i+1] = H[i]·B + s[i]  (mod M)', 'pw[i] = B^i', 'hash(l, r) = H[r] - H[l]·pw[r-l]  (mod M)', 'for 每個長度 L 的視窗:', '  若雜湊已出現過 → 候選重複（再逐字確認）'],
  inputs: [inText('s', '字串', 'banana_bandana', () => rnd.pick(['abcabcabc', 'mississippi', 'aabaabaab'])), inNum('L', '子字串長度 L', 3, 1, 20)],
  run({ s, L }) {
    const r = new Rec();
    const B = 131, M = 1000003, n = s.length;
    const H = [0], pw = [1];
    for (let i = 0; i < n; i++) { H.push((H[i] * B + s.charCodeAt(i)) % M); pw.push((pw[i] * B) % M); }
    r.snap('計算前綴雜湊 H', [cells(s.split(''), {}, { title: 's' }), cells(H, {}, { title: 'H[i]（前 i 個字元的雜湊）' })], 1);
    const seen = new Map<number, number>();
    const dups: string[] = [];
    const sub = (l: number) => (((H[l + L] - H[l] * pw[L]) % M) + M) % M;
    for (let l = 0; l + L <= n; l++) {
      const h = sub(l);
      const prev = seen.get(h);
      const c: Record<number, Color> = Object.fromEntries(Array.from({ length: L }, (_, k) => [l + k, 'active' as Color]));
      if (prev !== undefined && s.slice(prev, prev + L) === s.slice(l, l + L)) {
        for (let k = 0; k < L; k++) c[prev + k] = 'done';
        dups.push(`"${s.slice(l, l + L)}" @ ${prev}, ${l}`);
        r.snap(`hash(${l}, ${l + L}) = H[${l + L}] − H[${l}]·B^${L} = ${h}，與位置 ${prev} 相同 → 重複子字串 "${s.slice(l, l + L)}"`, [cells(s.split(''), c, { title: 's' }), cells(H, { [l]: 'compare', [l + L]: 'compare' }, { title: 'H[i]' }), text(dups, '重複子字串')], 5);
      } else {
        if (prev === undefined) seen.set(h, l);
        r.snap(`hash("${s.slice(l, l + L)}") = ${h}`, [cells(s.split(''), c, { title: 's' }), cells(H, { [l]: 'compare', [l + L]: 'compare' }, { title: 'H[i]' }), text(dups, '重複子字串')], 3);
      }
    }
    r.snap(`完成，找到 ${dups.length} 組重複`, [cells(s.split(''), {}, { title: 's' }), text(dups, '重複子字串')]);
    return r.frames;
  },
};

function suffixArray(s: string, r?: Rec) {
  const n = s.length;
  let sa = Array.from({ length: n }, (_, i) => i);
  let rank = s.split('').map((c) => c.charCodeAt(0));
  const show = (k: number, msg: string, line: number) => {
    if (!r) return;
    r.snap(msg, [table(sa.map((i) => [i, rank[i], s.slice(i)]), {}, { colHeaders: ['SA', `rank (長度 ${k})`, '後綴'], title: '後綴陣列（依目前 rank 排序）' })], line);
  };
  show(1, '初始 rank = 字元碼，依第一個字元排序', 1);
  sa.sort((a, b) => rank[a] - rank[b]);
  show(1, '依第一個字元排序', 1);
  for (let k = 1; k < n; k <<= 1) {
    const key = (i: number): [number, number] => [rank[i], i + k < n ? rank[i + k] : -1];
    sa.sort((a, b) => { const x = key(a), y = key(b); return x[0] - y[0] || x[1] - y[1]; });
    const nr = new Array(n).fill(0);
    for (let i = 1; i < n; i++) { const x = key(sa[i - 1]), y = key(sa[i]); nr[sa[i]] = nr[sa[i - 1]] + (x[0] !== y[0] || x[1] !== y[1] ? 1 : 0); }
    rank = nr;
    show(2 * k, `以 (rank[i], rank[i+${k}]) 排序，得到長度 ${2 * k} 的 rank`, 3);
    if (rank[sa[n - 1]] === n - 1) break;
  }
  return sa;
}

const saAlgo: AlgoDef = {
  id: 'suffix-array', name: '後綴陣列建構', en: 'Suffix Array (Prefix Doubling)', cat,
  desc: '把字串所有後綴依字典序排序後的起始位置陣列。倍增法：已知長度 k 的 rank，以 (rank[i], rank[i+k]) 為鍵排序即可得到長度 2k 的 rank，log n 輪後完成。',
  time: 'O(n log² n)（基數排序可到 O(n log n)）', space: 'O(n)',
  code: ['rank[i] = s[i]', 'k = 1', 'repeat:', '  依 (rank[i], rank[i+k]) 排序 SA', '  重新編號得到新的 rank', '  k *= 2，直到所有 rank 都不同'],
  inputs: [inText('s', '字串', 'banana$', () => rnd.pick(['mississippi$', 'abracadabra$', 'aaaab$', 'cabbage$']))],
  run({ s }) {
    const r = new Rec();
    const sa = suffixArray(s, r);
    r.snap(`SA = [${sa.join(', ')}]`, [table(sa.map((i) => [i, s.slice(i)]), Object.fromEntries(sa.map((_, k) => [`${k},0`, 'done'])) as CM, { colHeaders: ['SA[i]', '後綴'], rowHeaders: sa.map((_, i) => i) })], 6);
    return r.frames;
  },
};

const kasai: AlgoDef = {
  id: 'kasai-lcp', name: '最長共同前綴陣列', en: "Kasai's LCP Array", cat,
  desc: '在 O(n) 內由後綴陣列求 LCP 陣列（相鄰後綴的最長共同前綴）。關鍵性質：依原字串順序處理後綴時，LCP 每次最多減少 1，所以 h 不必從 0 重算。',
  time: 'O(n)', space: 'O(n)',
  code: ['rank[SA[i]] = i', 'h = 0', 'for i = 0 .. n-1  (依原字串位置):', '  if rank[i] > 0:', '    j = SA[rank[i] - 1]  (前一個後綴)', '    while s[i+h] == s[j+h]: h++', '    lcp[rank[i]] = h', '    if h > 0: h--'],
  inputs: [inText('s', '字串', 'banana$', () => rnd.pick(['mississippi$', 'abracadabra$', 'aaaab$']))],
  run({ s }) {
    const r = new Rec();
    const sa = suffixArray(s);
    const n = s.length;
    const rank = new Array(n).fill(0);
    sa.forEach((p, i) => (rank[p] = i));
    const lcp: (number | null)[] = new Array(n).fill(null);
    lcp[0] = 0;
    const T = (hl: CM = {}) => table(sa.map((p, i) => [p, lcp[i], s.slice(p)]), hl, { colHeaders: ['SA', 'LCP', '後綴'], rowHeaders: sa.map((_, i) => i) });
    r.snap('由後綴陣列建立 rank', [T()], 1);
    let h = 0;
    for (let i = 0; i < n; i++) {
      if (rank[i] > 0) {
        const j = sa[rank[i] - 1];
        const h0 = h;
        while (i + h < n && j + h < n && s[i + h] === s[j + h]) h++;
        lcp[rank[i]] = h;
        r.snap(`後綴 ${i}（"${s.slice(i)}"）與前一個後綴 ${j}（"${s.slice(j)}"）：從 h = ${h0} 開始延伸，LCP = ${h}`, [T({ [`${rank[i]},2`]: 'active', [`${rank[i] - 1},2`]: 'compare', [`${rank[i]},1`]: 'swap' }), vars({ i, h })], 7);
        if (h > 0) h--;
      }
    }
    r.snap(`LCP = [${lcp.join(', ')}]，最長重複子字串長度 = ${Math.max(...(lcp as number[]))}`, [T(Object.fromEntries(sa.map((_, i) => [`${i},1`, 'done'])) as CM)]);
    return r.frames;
  },
};

export default [naive, kmp, rabin, boyerMoore, horspool, zalg, aho, manacher, rolling, saAlgo, kasai];
