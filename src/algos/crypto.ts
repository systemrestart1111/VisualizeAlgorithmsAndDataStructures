import type { AlgoDef, Color, GEdge, GNode, Panel } from '../core/types';
import { Rec, bars, cells, inNum, inSeed, inSelect, inText, rnd, table, text, vars } from '../core/helpers';
import { ALPHA, fromHex, gcd, hex2, invMod, isLetter, isPrime, lettersOnly, mod, parkMiller, parseInts, parseMatrix, powModBig, ringNodes, toHex, utf8 } from '../core/extra';
import { DEMO_RSA, SHA_K, aesDecrypt, aesEncrypt, bigToBytes, bytesToBig, hmacSha256, keyExpansion, mgf1, sha256, stateRows, w32, type ShaTrace } from '../core/cryptolib';

const cat = 'crypto';
const modeInput = inSelect('mode', '模式', [['enc', '加密'], ['dec', '解密']]);
const WORDS = ['ATTACK AT DAWN', 'MEET ME AT NOON', 'HELLO WORLD', 'SECRET MESSAGE', 'KEEP IT SIMPLE', 'THE QUICK BROWN FOX'];
const limitText = (s: string, n = 80) => {
  if (s.length > n) throw new Error(`為了清楚呈現，文字最多 ${n} 個字元`);
  return s;
};
/** 逐字轉換的進度表：上列原文、下列輸出，之後可再加中間列 */
const progress = (src: string[], rows: [string, string[]][], i: number, hl: Color = 'active') => {
  const colors: Record<string, Color> = {};
  for (let r = 0; r <= rows.length; r++) colors[`${r},${i}`] = r === rows.length ? 'done' : hl;
  return table([src, ...rows.map((x) => x[1])], colors, { rowHeaders: ['輸入', ...rows.map((x) => x[0])] });
};

// ---------------- 凱撒 ----------------
const wheel = (k: number, idx: number | null): Panel => {
  const outer = ringNodes(ALPHA.split(''), 150, { prefix: 'o', colors: idx === null ? {} : { [idx]: 'active' } });
  const inner = ringNodes(ALPHA.split('').map((_, i) => ALPHA[mod(i + k, 26)]), 108, { prefix: 'i', colors: idx === null ? {} : { [idx]: 'done' }, r: 13 });
  const edges: GEdge[] = idx === null ? [] : [{ from: 'o' + idx, to: 'i' + idx, color: 'active', directed: true }];
  return { type: 'graph', title: `字母圓盤：外圈明文、內圈密文（位移 ${k}）`, nodes: [...outer, ...inner], edges, height: 360, w: 'half' };
};
const shiftChar = (ch: string, k: number) => {
  if (!isLetter(ch)) return ch;
  const base = ch <= 'Z' ? 65 : 97;
  return String.fromCharCode(mod(ch.charCodeAt(0) - base + k, 26) + base);
};

const caesar: AlgoDef = {
  id: 'caesar-cipher', name: '凱撒密碼', en: 'Caesar Cipher', cat,
  desc: '每個字母沿字母表往後位移固定的 k 格（超過 Z 繞回 A），解密時位移 −k。只有 26 種金鑰，可以直接暴力嘗試，因此只適合教學。本頁保留大小寫，非字母原樣輸出。',
  time: 'O(n)', space: 'O(n)',
  code: ['k = k mod 26；解密時 k = −k', 'for ch in text:', '  if ch 不是英文字母: out += ch；continue', '  base = ch 是大寫 ? "A" : "a"', '  out += chr((ch − base + k) mod 26 + base)'],
  inputs: [inText('text', '文字', 'Hello, World! XYZ', () => rnd.pick(WORDS)), inNum('k', '位移 k', 3, -100, 100, () => rnd.int(1, 25)), modeInput],
  run({ text: s, k, mode }) {
    const r = new Rec();
    limitText(s);
    const kk = mod(mode === 'dec' ? -k : k, 26);
    const src: string[] = String(s).split('');
    const out: string[] = src.map(() => '');
    r.snap(`位移 ${k}${mode === 'dec' ? '（解密，等同位移 ' + kk + '）' : ''}，取 mod 26 後為 ${kk}` + (kk === 0 ? '：輸出與輸入相同' : ''), [wheel(kk, null), progress(src, [['輸出', out]], -1)], 1);
    src.forEach((ch, i) => {
      if (!isLetter(ch)) { out[i] = ch; r.snap(`「${ch}」不是字母，原樣輸出`, [wheel(kk, null), progress(src, [['輸出', out]], i, 'muted')], 3); return; }
      const idx = ch.toUpperCase().charCodeAt(0) - 65;
      out[i] = shiftChar(ch, kk);
      r.snap(`${ch} → (${idx} + ${kk}) mod 26 = ${mod(idx + kk, 26)} → ${out[i]}`, [wheel(kk, idx), progress(src, [['輸出', out]], i)], 5);
    });
    r.snap(`結果：${out.join('')}`, [wheel(kk, null), progress(src, [['輸出', out]], -1), vars({ 輸出: out.join('') })]);
    return r.frames;
  },
};

// ---------------- 維吉尼亞 ----------------
const vigenere: AlgoDef = {
  id: 'vigenere-cipher', name: '維吉尼亞密碼', en: 'Vigenère Cipher', cat,
  desc: '把關鍵字重複對齊在明文下方，每個字母的位移量由對應的關鍵字字母決定（A = 0、B = 1…），同一個字母可能被加密成不同字母，能抵抗單純的頻率分析。本頁規定：非字母原樣輸出，且不消耗關鍵字位置。',
  time: 'O(n)', space: 'O(n)',
  code: ['j = 0', 'for ch in text:', '  if ch 不是字母: out += ch；continue   (不消耗關鍵字)', '  k = key[j mod |key|] − "A"；解密時 k = −k', '  out += shift(ch, k)', '  j += 1'],
  inputs: [inText('text', '文字', 'ATTACK AT DAWN!', () => rnd.pick(WORDS)), inText('key', '關鍵字（英文字母）', 'LEMON', () => rnd.pick(['LEMON', 'KEY', 'CIPHER', 'SECRET', 'VIGENERE'])), modeInput],
  run({ text: s, key, mode }) {
    const r = new Rec();
    limitText(s);
    const K = lettersOnly(key);
    if (!K) throw new Error('關鍵字至少要有一個英文字母');
    const src: string[] = String(s).split('');
    const kr: string[] = src.map(() => ''), sh: string[] = src.map(() => ''), out: string[] = src.map(() => '');
    const alpha = (k: number, idx: number) => table([ALPHA.split(''), ALPHA.split('').map((_, i) => ALPHA[mod(i + k, 26)])], { [`0,${idx}`]: 'active', [`1,${idx}`]: 'done' }, { rowHeaders: ['明文', `位移 ${k}`], title: '本字使用的字母對照' });
    r.snap(`關鍵字 ${K} 會重複對齊在字母下方`, [progress(src, [['關鍵字', kr], ['位移', sh], ['輸出', out]], -1)], 1);
    let j = 0;
    src.forEach((ch, i) => {
      if (!isLetter(ch)) { out[i] = ch; r.snap(`「${ch}」不是字母：原樣輸出，關鍵字位置不前進`, [progress(src, [['關鍵字', kr], ['位移', sh], ['輸出', out]], i, 'muted')], 3); return; }
      const kc = K[j % K.length];
      let k = kc.charCodeAt(0) - 65;
      if (mode === 'dec') k = -k;
      kr[i] = kc; sh[i] = String(k); out[i] = shiftChar(ch, k);
      r.snap(`${ch} 配上關鍵字 ${kc}（位移 ${k}）→ ${out[i]}`, [progress(src, [['關鍵字', kr], ['位移', sh], ['輸出', out]], i), alpha(mod(k, 26), ch.toUpperCase().charCodeAt(0) - 65)], 5);
      j++;
    });
    r.snap(`結果：${out.join('')}`, [progress(src, [['關鍵字', kr], ['位移', sh], ['輸出', out]], -1), vars({ 輸出: out.join('') })]);
    return r.frames;
  },
};

// ---------------- 仿射 ----------------
const affine: AlgoDef = {
  id: 'affine-cipher', name: '仿射密碼', en: 'Affine Cipher', cat,
  desc: '把字母 x（A = 0）映射為 E(x) = (a·x + b) mod 26，解密 D(y) = a⁻¹·(y − b) mod 26。a 必須與 26 互質才有反元素，否則不同字母會被映射到同一個字母而無法解密。',
  time: 'O(n)', space: 'O(n)',
  code: ['檢查 gcd(a, 26) = 1，否則拒絕', 'a⁻¹ = 擴展歐幾里得求 a 在 mod 26 的反元素', 'for ch in text:', '  加密：y = (a·x + b) mod 26', '  解密：x = a⁻¹·(y − b) mod 26', '  非字母原樣輸出'],
  inputs: [inText('text', '文字', 'AFFINE CIPHER', () => rnd.pick(WORDS)), inNum('a', 'a（需與 26 互質）', 5, -99, 99, () => rnd.pick([1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25])), inNum('b', 'b', 8, -99, 99, () => rnd.int(0, 25)), modeInput],
  run({ text: s, a, b, mode }) {
    const r = new Rec();
    limitText(s);
    const A = mod(a, 26), B = mod(b, 26);
    if (gcd(A, 26) !== 1) throw new Error(`a = ${a} 與 26 不互質（gcd = ${gcd(A, 26)}），無法解密，請改用 1、3、5、7、9、11、15、17、19、21、23、25`);
    const ai = invMod(A, 26)!;
    const f = (x: number) => (mode === 'dec' ? mod(ai * (x - B), 26) : mod(A * x + B, 26));
    const mapRow = ALPHA.split('').map((_, x) => ALPHA[f(x)]);
    const mt = (x: number) => table([ALPHA.split(''), mapRow], x < 0 ? {} : { [`0,${x}`]: 'active', [`1,${x}`]: 'done' }, { rowHeaders: ['輸入', '輸出'], title: mode === 'dec' ? `D(y) = ${ai}·(y − ${B}) mod 26` : `E(x) = (${A}x + ${B}) mod 26` });
    r.snap(`gcd(${A}, 26) = 1，a⁻¹ = ${ai}（${A}·${ai} = ${A * ai} ≡ 1）`, [mt(-1), vars({ a: A, b: B, 'a⁻¹': ai })], 2);
    const src: string[] = String(s).split(''), out = src.map(() => '');
    src.forEach((ch, i) => {
      if (!isLetter(ch)) { out[i] = ch; r.snap(`「${ch}」原樣輸出`, [mt(-1), progress(src, [['輸出', out]], i, 'muted')], 6); return; }
      const x = ch.toUpperCase().charCodeAt(0) - 65, y = f(x);
      out[i] = ch <= 'Z' ? ALPHA[y] : ALPHA[y].toLowerCase();
      r.snap(mode === 'dec' ? `${ch}：${ai}·(${x} − ${B}) mod 26 = ${y} → ${out[i]}` : `${ch}：(${A}·${x} + ${B}) mod 26 = ${y} → ${out[i]}`, [mt(x), progress(src, [['輸出', out]], i)], mode === 'dec' ? 5 : 4);
    });
    r.snap(`結果：${out.join('')}`, [mt(-1), progress(src, [['輸出', out]], -1)]);
    return r.frames;
  },
};

// ---------------- 柵欄 ----------------
const railPattern = (n: number, rails: number) => {
  const rowOf: number[] = [];
  let row = 0, dir = 1;
  for (let i = 0; i < n; i++) {
    rowOf.push(row);
    if (rails > 1) { if (row === 0) dir = 1; else if (row === rails - 1) dir = -1; row += dir; }
  }
  return rowOf;
};
const railFence: AlgoDef = {
  id: 'rail-fence-cipher', name: '柵欄密碼', en: 'Rail Fence Cipher', cat,
  desc: '換位密碼：把字元沿鋸齒路徑寫在 k 條「軌道」上，再一軌一軌讀出。字元本身不變，只改變位置。解密時先算出每個位置屬於哪一軌，依序填回再沿鋸齒讀出。只有一軌或字串比軌數短時仍可正確運作。',
  time: 'O(n)', space: 'O(n·k)',
  code: ['row = 0, dir = +1', 'for i, ch in text:', '  grid[row][i] = ch', '  到最上或最下一軌就反轉方向；row += dir', '加密：逐軌由左到右讀出', '解密：依鋸齒計算每軌字數，逐軌填入密文', '  再沿鋸齒路徑讀出'],
  inputs: [inText('text', '文字（含空白）', 'WEAREDISCOVERED', () => rnd.pick(WORDS).replace(/ /g, '')), inNum('rails', '軌數', 3, 1, 10, () => rnd.int(2, 5)), modeInput],
  run({ text: s, rails, mode }) {
    const r = new Rec();
    limitText(s, 60);
    const n = s.length;
    if (!n) throw new Error('文字不可為空');
    const rowOf = railPattern(n, rails);
    const grid = (fill: (string | null)[], hl: number, hlColor: Color = 'active') => {
      const rows = Array.from({ length: rails }, (_, rr) => Array.from({ length: n }, (_, i) => (rowOf[i] === rr ? fill[i] ?? '·' : '')));
      const colors: Record<string, Color> = {};
      fill.forEach((v, i) => { if (v !== null && v !== undefined) colors[`${rowOf[i]},${i}`] = 'visited'; });
      if (hl >= 0) colors[`${rowOf[hl]},${hl}`] = hlColor;
      return table(rows, colors, { rowHeaders: rows.map((_, i) => `軌 ${i}`), title: '鋸齒路徑' });
    };
    if (mode === 'enc') {
      const fill: (string | null)[] = new Array(n).fill(null);
      for (let i = 0; i < n; i++) { fill[i] = s[i]; r.snap(`「${s[i]}」寫在第 ${rowOf[i]} 軌`, [grid(fill, i)], 3); }
      const order = Array.from({ length: n }, (_, i) => i).sort((x, y) => rowOf[x] - rowOf[y] || x - y);
      let out = '';
      order.forEach((i) => { out += s[i]; r.snap(`第 ${rowOf[i]} 軌讀出「${s[i]}」`, [grid(fill, i, 'done'), cells(out.split(''), {}, { title: '密文' })], 5); });
      r.snap(`密文：${out}`, [grid(fill, -1), vars({ 密文: out })]);
    } else {
      const order = Array.from({ length: n }, (_, i) => i).sort((x, y) => rowOf[x] - rowOf[y] || x - y);
      const counts = Array.from({ length: rails }, (_, rr) => rowOf.filter((x) => x === rr).length);
      const fill: (string | null)[] = new Array(n).fill(null);
      r.snap(`依鋸齒路徑，各軌字數為 ${counts.join('、')}`, [grid(fill, -1), cells(s.split(''), {}, { title: '密文' })], 6);
      order.forEach((pos, k) => { fill[pos] = s[k]; r.snap(`密文第 ${k} 個字「${s[k]}」填到第 ${rowOf[pos]} 軌`, [grid(fill, pos), cells(s.split(''), { [k]: 'active' }, { title: '密文' })], 6); });
      let out = '';
      for (let i = 0; i < n; i++) { out += fill[i]; r.snap(`沿鋸齒讀出「${fill[i]}」`, [grid(fill, i, 'done'), cells(out.split(''), {}, { title: '明文' })], 7); }
      r.snap(`明文：${out}`, [grid(fill, -1), vars({ 明文: out })]);
    }
    return r.frames;
  },
};

// ---------------- 欄式換位 ----------------
const columnar: AlgoDef = {
  id: 'columnar-transposition', name: '欄式換位密碼', en: 'Columnar Transposition', cat,
  desc: '把文字逐列寫入寬度為關鍵字長度的表格，再依關鍵字字母的字母順序逐欄讀出。重複字母依出現位置穩定排序；本頁只保留英文字母，最後一列不足時補 X。',
  time: 'O(n log k)（排序關鍵字）', space: 'O(n)',
  code: ['text = 只保留字母並轉大寫，補 X 到 |key| 的倍數', '逐列寫入 rows × |key| 表格', 'order = 依 (key[c], c) 穩定排序的欄號', '加密：for c in order: 由上到下讀出第 c 欄', '解密：for c in order: 由上到下把密文填入第 c 欄', '  再逐列讀出'],
  inputs: [inText('text', '文字', 'WE ARE DISCOVERED FLEE AT ONCE', () => rnd.pick(WORDS)), inText('key', '關鍵字', 'ZEBRAS', () => rnd.pick(['ZEBRAS', 'KEY', 'CIPHER', 'BANANA', 'GERMAN'])), modeInput],
  run({ text: s, key, mode }) {
    const r = new Rec();
    const K = lettersOnly(key);
    if (!K) throw new Error('關鍵字至少要有一個英文字母');
    let T = lettersOnly(limitText(s, 120));
    if (!T) throw new Error('文字至少要有一個英文字母');
    const w = K.length;
    if (mode === 'dec' && T.length % w) throw new Error(`密文長度 ${T.length} 不是關鍵字長度 ${w} 的倍數`);
    const pad = (w - (T.length % w)) % w;
    if (mode === 'enc') T += 'X'.repeat(pad);
    const rows = T.length / w;
    const order = Array.from({ length: w }, (_, c) => c).sort((a, b) => (K[a] < K[b] ? -1 : K[a] > K[b] ? 1 : a - b));
    const rank = new Array(w);
    order.forEach((c, i) => (rank[c] = i + 1));
    const g: string[][] = Array.from({ length: rows }, () => new Array(w).fill(''));
    const show = (colors: Record<string, Color>, title = '表格') => table(g, colors, { colHeaders: K.split('').map((ch, c) => `${ch}${rank[c]}`), title: title + '（表頭數字為讀出順序）' });
    if (mode === 'enc') {
      for (let i = 0; i < T.length; i++) g[Math.floor(i / w)][i % w] = T[i];
      r.snap(`逐列寫入 ${rows}×${w} 表格` + (pad ? `，補了 ${pad} 個 X` : ''), [show({})], 2);
      r.snap(`欄的讀出順序：${order.map((c) => K[c] + '(' + c + ')').join(' → ')}`, [show(Object.fromEntries(order.slice(0, 1).flatMap((c) => g.map((_, rr) => [`${rr},${c}`, 'active' as Color]))))], 3);
      let out = '';
      order.forEach((c, k) => {
        out += g.map((row) => row[c]).join('');
        const col: Record<string, Color> = {};
        order.slice(0, k).forEach((cc) => g.forEach((_, rr) => (col[`${rr},${cc}`] = 'visited')));
        g.forEach((_, rr) => (col[`${rr},${c}`] = 'done'));
        r.snap(`讀出第 ${c} 欄（${K[c]}）：${g.map((row) => row[c]).join('')}`, [show(col), cells(out.split(''), {}, { title: '密文' })], 4);
      });
      r.snap(`密文：${out}`, [show({}), vars({ 密文: out })]);
    } else {
      let k = 0;
      order.forEach((c) => {
        for (let rr = 0; rr < rows; rr++) g[rr][c] = T[k++];
        r.snap(`把密文接下來 ${rows} 個字填入第 ${c} 欄（${K[c]}）`, [show(Object.fromEntries(g.map((_, rr) => [`${rr},${c}`, 'swap' as Color])))], 5);
      });
      const out = g.map((row) => row.join('')).join('');
      r.snap(`逐列讀出：${out}（補的 X 無法自動判斷是否為原文，保留不刪）`, [show({}), vars({ 明文: out })], 6);
    }
    return r.frames;
  },
};

// ---------------- Playfair ----------------
const PF = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
const playfair: AlgoDef = {
  id: 'playfair-cipher', name: '普萊費爾密碼', en: 'Playfair Cipher', cat,
  desc: '以關鍵字建立 5×5 字母表（I 與 J 合併），把文字切成兩兩一組再替換：同一列各取右邊、同一行各取下面、否則取矩形另外兩角。規則：J 視為 I；同組兩字相同時在中間插入 X（若是 X 則插 Q）；長度為奇數時末尾補 X（末字為 X 則補 Q）。解密後補字無法唯一地自動移除，因此保留。',
  time: 'O(n)', space: 'O(1)（25 格表）',
  code: ['表 = 關鍵字（去重複，J→I）接上其餘字母，排成 5×5', '切成字母對：相同字母中間插 X（XX 則插 Q），奇數長度補 X', 'for (a, b) in pairs:', '  同一列：各取右邊一格（解密取左邊）', '  同一行：各取下面一格（解密取上面）', '  其他：取同列、對方所在行的字母（矩形對角）'],
  inputs: [inText('key', '關鍵字', 'PLAYFAIR EXAMPLE', () => rnd.pick(['MONARCHY', 'PLAYFAIR', 'KEYWORD', 'SECRET'])), inText('text', '文字', 'HIDE THE GOLD IN THE TREE STUMP', () => rnd.pick(WORDS)), modeInput],
  run({ key, text: s, mode }) {
    const r = new Rec();
    const prep = (x: string) => lettersOnly(x).replace(/J/g, 'I');
    const seen = new Set<string>();
    const sq: string[] = [];
    for (const ch of prep(key) + PF) if (!seen.has(ch)) { seen.add(ch); sq.push(ch); }
    const pos: Record<string, [number, number]> = {};
    sq.forEach((ch, i) => (pos[ch] = [Math.floor(i / 5), i % 5]));
    const grid = (hl: Record<string, Color> = {}) => table(Array.from({ length: 5 }, (_, rr) => sq.slice(5 * rr, 5 * rr + 5)), Object.fromEntries(Object.entries(hl).map(([ch, c]) => [pos[ch].join(','), c])), { title: '5×5 字母表（I/J 共用一格）', w: 'half' });
    r.snap(`由關鍵字 ${prep(key) || '（空）'} 建立字母表`, [grid(Object.fromEntries([...new Set(prep(key))].map((ch) => [ch, 'active' as Color])))], 1);
    const t = prep(limitText(s, 120));
    if (!t) throw new Error('文字至少要有一個英文字母');
    const pairs: [string, string][] = [];
    if (mode === 'enc') {
      let i = 0;
      while (i < t.length) {
        const a = t[i];
        let b = t[i + 1];
        if (b === undefined) { b = a === 'X' ? 'Q' : 'X'; i += 1; }
        else if (a === b) { b = a === 'X' ? 'Q' : 'X'; i += 1; }
        else i += 2;
        pairs.push([a, b]);
      }
    } else {
      if (t.length % 2) throw new Error('密文長度必須為偶數');
      for (let i = 0; i < t.length; i += 2) {
        if (t[i] === t[i + 1]) throw new Error(`密文中同一組出現相同字母 ${t[i]}${t[i + 1]}，不是合法的 Playfair 密文`);
        pairs.push([t[i], t[i + 1]]);
      }
    }
    r.snap(`切成 ${pairs.length} 組：${pairs.map((p) => p.join('')).join(' ')}`, [grid(), text([pairs.map((p) => p.join('')).join(' ')], '字母對')], 2);
    const d = mode === 'dec' ? 4 : 1;
    const out: string[] = [];
    pairs.forEach(([a, b], i) => {
      const [ra, ca] = pos[a], [rb, cb] = pos[b];
      let x: string, y: string, why: string, line: number;
      if (ra === rb) { x = sq[ra * 5 + ((ca + d) % 5)]; y = sq[rb * 5 + ((cb + d) % 5)]; why = '同一列'; line = 4; }
      else if (ca === cb) { x = sq[((ra + d) % 5) * 5 + ca]; y = sq[((rb + d) % 5) * 5 + cb]; why = '同一行'; line = 5; }
      else { x = sq[ra * 5 + cb]; y = sq[rb * 5 + ca]; why = '矩形'; line = 6; }
      out.push(x + y);
      r.snap(`${a}${b}：${why} → ${x}${y}`, [grid({ [a]: 'active', [b]: 'active', [x]: 'done', [y]: 'done' }), table([pairs.map((p) => p.join('')), pairs.map((_, k) => out[k] ?? '')], { [`0,${i}`]: 'active', [`1,${i}`]: 'done' }, { rowHeaders: ['輸入', '輸出'] })], line);
    });
    r.snap(`結果：${out.join(' ')}` + (mode === 'dec' ? '（插入的 X／Q 需要讀者自行判斷）' : ''), [grid(), vars({ 輸出: out.join('') })]);
    return r.frames;
  },
};

// ---------------- 頻率分析 ----------------
const EN_FREQ = [8.17, 1.49, 2.78, 4.25, 12.7, 2.23, 2.02, 6.09, 6.97, 0.15, 0.77, 4.03, 2.41, 6.75, 7.51, 1.93, 0.1, 5.99, 6.33, 9.06, 2.76, 0.98, 2.36, 0.15, 1.97, 0.07];
const SAMPLE = 'WKH TXLFN EURZQ IRA MXPSV RYHU WKH ODCB GRJ. IUHTXHQFB DQDOBVLV LV D FODVVLF ZDB WR EUHDN VXEVWLWXWLRQ FLSKHUV EHFDXVH VRPH OHWWHUV DSSHDU PXFK PRUH RIWHQ WKDQ RWKHUV LQ QRUPDO HQJOLVK WHAW';
const freqAnalysis: AlgoDef = {
  id: 'frequency-analysis', name: '字母頻率分析', en: 'Frequency Analysis', cat,
  desc: '英文中 E、T、A 等字母出現頻率較高。統計密文字母頻率，對每個可能的凱撒位移計算解密後分布與英文分布的卡方距離 χ²，距離越小越像英文。文字太短時統計不穩定，最佳候選可能是錯的。',
  time: 'O(n + 26²)', space: 'O(26)',
  code: ['count[c] = 密文中字母 c 的次數', 'for k in 0..25:', '  χ²(k) = Σ_c (count[(c + k) mod 26] − N·p_c)² / (N·p_c)', 'best = argmin χ²(k)', '以位移 best 解密並檢查是否通順'],
  inputs: [inText('text', '密文', SAMPLE, () => { const k = rnd.int(1, 25); return 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG AND KEEPS RUNNING THROUGH THE FOREST UNTIL NIGHT FALLS'.replace(/[A-Z]/g, (c) => shiftChar(c, k)); }, true)],
  run({ text: s }) {
    const r = new Rec();
    const T = lettersOnly(s);
    if (!T) throw new Error('密文至少要有一個英文字母');
    const N = T.length;
    const cnt = new Array(26).fill(0);
    const labels = ALPHA.split('');
    for (let i = 0; i < N; i++) {
      cnt[T.charCodeAt(i) - 65]++;
      if (i < 12 || i === N - 1) r.snap(`統計第 ${i + 1} 個字母 ${T[i]}`, [bars([...cnt], { [T.charCodeAt(i) - 65]: 'active' }, { labels: labels.map((c, k) => `${c}${cnt[k] || ''}`), title: '密文字母次數' })], 1);
    }
    const chi = Array.from({ length: 26 }, (_, k) => cnt.reduce((sum, _, c) => { const e = (N * EN_FREQ[c]) / 100; const o = cnt[(c + k) % 26]; return sum + ((o - e) ** 2) / e; }, 0));
    for (let k = 0; k < 26; k++) {
      const shifted = Array.from({ length: 26 }, (_, c) => cnt[(c + k) % 26]);
      if (k < 4 || k % 5 === 0) r.snap(`假設位移 ${k}：χ² = ${chi[k].toFixed(1)}`, [bars(shifted, {}, { labels, title: `以位移 ${k} 解密後的分布`, w: 'half' }), bars(EN_FREQ.map((f) => +((N * f) / 100).toFixed(1)), {}, { labels, title: '英文期望次數', w: 'half' }), bars(chi.map((x, i) => (i <= k ? +x.toFixed(1) : 0)), { [k]: 'active' }, { title: 'χ²（越小越像英文）' })], 3);
    }
    const order = chi.map((x, k) => [x, k]).sort((a, b) => a[0] - b[0]);
    const best = order[0][1];
    const plain = String(s).replace(/[A-Za-z]/g, (c: string) => shiftChar(c, -best));
    r.snap(`最佳位移 ${best}（χ² = ${order[0][0].toFixed(1)}）；次佳 ${order[1][1]}、${order[2][1]}` + (N < 40 ? '。文字很短，結果可能不可靠' : ''), [bars(chi.map((x) => +x.toFixed(1)), { [best]: 'done', [order[1][1]]: 'compare', [order[2][1]]: 'compare' }, { title: 'χ²' }), text([plain], '以最佳位移解密')], 4);
    return r.frames;
  },
};

// ---------------- 一次性密碼本 ----------------
const otp: AlgoDef = {
  id: 'one-time-pad', name: '一次性密碼本', en: 'One-Time Pad', cat,
  desc: '用與訊息等長、真正隨機且只用一次的金鑰逐位元組做 XOR：c = m ⊕ k。若同一把金鑰被用在兩則訊息，c₁ ⊕ c₂ = m₁ ⊕ m₂，金鑰被消掉，攻擊者就能從兩則明文的關係推敲內容。本頁以固定種子產生示範金鑰，真實使用需密碼學安全的亂數。',
  time: 'O(n)', space: 'O(n)',
  code: ['key = 與訊息等長的隨機位元組（只用一次）', 'c[i] = m[i] XOR key[i]', 'm[i] = c[i] XOR key[i]       (XOR 兩次還原)', '重用金鑰：c1 XOR c2 = m1 XOR m2'],
  inputs: [inText('m1', '訊息 1', 'HELLO WORLD', () => rnd.pick(WORDS)), inText('m2', '訊息 2（示範金鑰重用）', 'SECRET PLAN', () => rnd.pick(WORDS)), inSeed()],
  run({ m1, m2, seed }) {
    const r = new Rec();
    const a = utf8(limitText(m1, 32)), b = utf8(limitText(m2, 32));
    if (!a.length || !b.length) throw new Error('訊息不可為空');
    const L = Math.max(a.length, b.length);
    const g = parkMiller(seed);
    const key = Array.from({ length: L }, () => g.int(256));
    const hx = (xs: number[]) => xs.map(hex2);
    const c1 = a.map((x, i) => x ^ key[i]);
    r.snap(`產生 ${L} 個位元組的金鑰（種子 ${seed}）`, [table([hx(key)], {}, { rowHeaders: ['金鑰'] })], 1);
    const rows1 = (i: number) => table([a.map((x) => String.fromCharCode(x)), hx(a), hx(key.slice(0, a.length)), hx(c1.slice(0, i + 1))], Object.fromEntries([0, 1, 2, 3].map((rr) => [`${rr},${i}`, rr === 3 ? 'done' : ('active' as Color)])), { rowHeaders: ['m1', 'm1 (hex)', 'key', 'c1'] });
    for (let i = 0; i < a.length; i++) r.snap(`c1[${i}] = ${hex2(a[i])} ⊕ ${hex2(key[i])} = ${hex2(c1[i])}`, [rows1(i)], 2);
    const back = c1.map((x, i) => x ^ key[i]);
    r.snap(`再 XOR 一次同一把金鑰就還原：${String.fromCharCode(...back)}`, [table([hx(c1), hx(key.slice(0, a.length)), hx(back), back.map((x) => String.fromCharCode(x))], {}, { rowHeaders: ['c1', 'key', 'c1⊕key', '文字'] })], 3);
    const c2 = b.map((x, i) => x ^ key[i]);
    const n = Math.min(a.length, b.length);
    const x1 = Array.from({ length: n }, (_, i) => c1[i] ^ c2[i]), x2 = Array.from({ length: n }, (_, i) => a[i] ^ b[i]);
    const same = x1.every((v, i) => v === x2[i]);
    r.snap(`錯誤示範：同一把金鑰加密 m2。c1 ⊕ c2 與 m1 ⊕ m2 ${same ? '完全相同' : '不同'}，金鑰被消去了`, [table([hx(c1.slice(0, n)), hx(c2.slice(0, n)), hx(x1), hx(x2)], Object.fromEntries(x1.flatMap((_, i) => [[`2,${i}`, 'bad' as Color], [`3,${i}`, 'bad' as Color]])), { rowHeaders: ['c1', 'c2', 'c1⊕c2', 'm1⊕m2'] }), vars({ 洩漏: same ? '是' : '否' }, undefined, { 洩漏: 'bad' })], 4);
    return r.frames;
  },
};

// ---------------- Hill ----------------
const matModInv = (K: number[][]): number[][] | null => {
  const n = K.length;
  const det = (A: number[][]): number => (A.length === 1 ? A[0][0] : A[0].reduce((s, x, j) => s + (j % 2 ? -1 : 1) * x * det(A.slice(1).map((row) => row.filter((_, k) => k !== j))), 0));
  const d = mod(det(K), 26);
  const di = invMod(d, 26);
  if (di === null) return null;
  if (n === 1) return [[di]];
  const adj = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => {
    const minor = K.filter((_, r) => r !== j).map((row) => row.filter((_, c) => c !== i));
    return mod(((i + j) % 2 ? -1 : 1) * det(minor), 26);
  }));
  return adj.map((row) => row.map((x) => mod(x * di, 26)));
};
const hill: AlgoDef = {
  id: 'hill-cipher', name: '希爾密碼', en: 'Hill Cipher', cat,
  desc: '把字母兩兩（或三三）分組成向量 p，密文向量 c = K·p mod 26。解密需要 K 在 mod 26 下的反矩陣 K⁻¹ = det(K)⁻¹·adj(K)，因此 det(K) 必須與 26 互質，否則拒絕這把金鑰。本頁只保留英文字母，不足一組補 X。',
  time: 'O(n·d)（d 為區塊大小）', space: 'O(d²)',
  code: ['det = det(K) mod 26；若 gcd(det, 26) ≠ 1 則拒絕', 'K⁻¹ = det⁻¹ · adj(K) mod 26', '文字轉成 0–25，補 X 到 d 的倍數', 'for 每個 d 字母區塊 p:', '  c = K · p mod 26（解密用 K⁻¹）', '  輸出 c 對應的字母'],
  inputs: [inText('key', '金鑰矩陣 K（2×2 或 3×3）', '3 3; 2 5', () => rnd.pick(['3 3; 2 5', '5 8; 17 3', '6 24 1; 13 16 10; 20 17 15', '2 3; 1 4'])), inText('text', '文字', 'HELP ME', () => rnd.pick(WORDS)), modeInput],
  run({ key, text: s, mode }) {
    const r = new Rec();
    const K = parseMatrix(key, '金鑰矩陣').map((row) => row.map((x) => mod(x, 26)));
    const d = K.length;
    if (d !== K[0].length || d < 2 || d > 3) throw new Error('金鑰必須是 2×2 或 3×3 的方陣');
    const Ki = matModInv(K);
    const detv = (() => { const A = K; return d === 2 ? A[0][0] * A[1][1] - A[0][1] * A[1][0] : A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]); })();
    if (!Ki) throw new Error(`det(K) mod 26 = ${mod(detv, 26)}，與 26 的最大公因數為 ${gcd(mod(detv, 26), 26)}，這把金鑰不可逆，拒絕使用`);
    r.snap(`det(K) mod 26 = ${mod(detv, 26)}，與 26 互質；K⁻¹ 存在`, [table(K, {}, { title: 'K', w: 'auto' }), table(Ki, {}, { title: 'K⁻¹ (mod 26)', w: 'auto' }), vars({ det: mod(detv, 26), 'det⁻¹': invMod(mod(detv, 26), 26) })], 1);
    const M = mode === 'dec' ? Ki : K;
    let T = lettersOnly(limitText(s, 90));
    if (!T) throw new Error('文字至少要有一個英文字母');
    if (mode === 'dec' && T.length % d) throw new Error(`密文長度必須是 ${d} 的倍數`);
    while (T.length % d) T += 'X';
    r.snap(`切成 ${T.length / d} 個長度 ${d} 的區塊`, [table([T.split(''), T.split('').map((c) => c.charCodeAt(0) - 65)], {}, { rowHeaders: ['字母', '數值'] })], 3);
    let out = '';
    for (let b = 0; b < T.length; b += d) {
      const p = T.slice(b, b + d).split('').map((c) => c.charCodeAt(0) - 65);
      const c = M.map((row) => mod(row.reduce((sum, x, k) => sum + x * p[k], 0), 26));
      out += c.map((x) => ALPHA[x]).join('');
      const detail = M.map((row, i) => `${row.map((x, k) => `${x}·${p[k]}`).join(' + ')} = ${row.reduce((sum, x, k) => sum + x * p[k], 0)} ≡ ${c[i]}`);
      r.snap(`區塊 ${T.slice(b, b + d)} → ${c.map((x) => ALPHA[x]).join('')}`, [table(M, {}, { title: mode === 'dec' ? 'K⁻¹' : 'K', w: 'auto' }), table(p.map((x) => [x]), {}, { title: 'p', w: 'auto' }), table(c.map((x) => [x]), Object.fromEntries(c.map((_, i) => [`${i},0`, 'done' as Color])), { title: 'c', w: 'auto' }), text(detail, '逐列計算 (mod 26)'), cells(out.split(''), {}, { title: '輸出' })], 5);
    }
    r.snap(`結果：${out}`, [vars({ 輸出: out })], 6);
    return r.frames;
  },
};

// ---------------- RSA ----------------
const sqMulTable = (b: bigint, e: bigint, m: bigint) => {
  const bitsStr = e.toString(2);
  let res = 1n;
  const rows: string[][] = [];
  for (const bit of bitsStr) {
    res = (res * res) % m;
    if (bit === '1') res = (res * b) % m;
    rows.push([bit, bit === '1' ? '平方後乘底數' : '平方', String(res)]);
  }
  return { res, rows };
};
const rsa: AlgoDef = {
  id: 'rsa-cipher', name: 'RSA 非對稱加密', en: 'RSA Encryption', cat,
  desc: '選兩個質數 p、q，n = pq，φ(n) = (p−1)(q−1)。公鑰 (n, e) 要求 gcd(e, φ) = 1，私鑰 d = e⁻¹ mod φ。加密 c = mᵉ mod n，解密 m = cᵈ mod n。本頁是「教科書 RSA」：沒有隨機填充，相同明文得到相同密文，實務必須搭配 OAEP 並使用 2048 位元以上的 n。',
  time: '模冪 O(log e) 次乘法', space: 'O(1)',
  code: ['檢查 p、q 為相異質數', 'n = p·q，φ = (p−1)(q−1)', '檢查 1 < e < φ 且 gcd(e, φ) = 1', 'd = e⁻¹ mod φ（擴展歐幾里得）', '加密：c = m^e mod n（平方乘法）', '解密：m = c^d mod n', '驗證解密結果等於原訊息'],
  inputs: [inNum('p', '質數 p', 61, 2, 46337, () => rnd.pick([53, 61, 67, 71, 89, 97, 101, 103])), inNum('q', '質數 q', 53, 2, 46337, () => rnd.pick([107, 109, 113, 127, 131, 137, 139])), inNum('e', '公開指數 e', 17, 2, 1e9, (c) => rnd.pick([3, 5, 7, 11, 13, 17, 257].filter((e) => gcd(e, (c.p - 1) * (c.q - 1)) === 1))), inText('m', '訊息（整數，逗號分隔，需 < n）', '65, 66, 67', (c) => Array.from({ length: 3 }, () => rnd.int(2, c.p * c.q - 1)).join(', '))],
  run({ p, q, e, m }) {
    const r = new Rec();
    if (!isPrime(p) || !isPrime(q)) throw new Error('p 與 q 都必須是質數');
    if (p === q) throw new Error('p 與 q 必須不同');
    const n = p * q, phi = (p - 1) * (q - 1);
    r.snap(`n = ${p}·${q} = ${n}，φ(n) = ${p - 1}·${q - 1} = ${phi}`, [vars({ p, q, n, 'φ(n)': phi })], 2);
    if (e <= 1 || e >= phi) throw new Error(`e 必須介於 1 與 φ(n) = ${phi} 之間`);
    if (gcd(e, phi) !== 1) throw new Error(`gcd(e, φ) = ${gcd(e, phi)} ≠ 1，e 沒有反元素`);
    // 擴展歐幾里得表
    const rows: (string | number)[][] = [];
    let [r0, r1, s0, s1] = [e, phi, 1, 0];
    while (r1) { const k = Math.floor(r0 / r1); rows.push([r0, r1, k, s0, s1]); [r0, r1] = [r1, r0 - k * r1]; [s0, s1] = [s1, s0 - k * s1]; }
    const d = mod(s0, phi);
    r.snap(`擴展歐幾里得得 d = ${d}（${e}·${d} mod ${phi} = ${(e * d) % phi}）`, [table(rows, {}, { colHeaders: ['r₀', 'r₁', '商', 's₀', 's₁'], title: '求 e 的反元素' }), vars({ 公鑰: `(${n}, ${e})`, 私鑰: `(${n}, ${d})` }, undefined, { 公鑰: 'active', 私鑰: 'bad' })], 4);
    const ms = parseInts(m, '訊息');
    if (!ms.length) throw new Error('請輸入至少一個訊息整數');
    if (ms.some((x) => x < 0 || x >= n)) throw new Error(`每個訊息都必須在 0 到 n − 1 = ${n - 1} 之間`);
    const cs: number[] = [];
    for (const x of ms) {
      const { res, rows: t } = sqMulTable(BigInt(x), BigInt(e), BigInt(n));
      cs.push(Number(res));
      r.snap(`加密 ${x}：${x}^${e} mod ${n} = ${res}`, [table(t, { [`${t.length - 1},2`]: 'done' }, { colHeaders: ['e 的位元', '動作', '目前結果'], title: `平方乘法（e = ${e} = ${e.toString(2)}₂）` }), cells(cs, {}, { title: '密文' })], 5);
    }
    const back: number[] = [];
    for (const c of cs) {
      const { res, rows: t } = sqMulTable(BigInt(c), BigInt(d), BigInt(n));
      back.push(Number(res));
      r.snap(`解密 ${c}：${c}^${d} mod ${n} = ${res}`, [table(t, { [`${t.length - 1},2`]: 'done' }, { colHeaders: ['d 的位元', '動作', '目前結果'], title: `平方乘法（d = ${d}）` }), cells(back, {}, { title: '解密結果' })], 6);
    }
    const ok = back.every((x, i) => x === ms[i]);
    r.snap(ok ? '往返成功：解密結果與原訊息相同。教科書 RSA 是確定性的，實務需加上 OAEP 隨機填充' : '解密結果不一致', [table([ms, cs, back], {}, { rowHeaders: ['明文', '密文', '解密'] }), vars({ 往返成功: ok ? '是' : '否' }, undefined, { 往返成功: ok ? 'done' : 'bad' })], 7);
    return r.frames;
  },
};

// ---------------- Diffie–Hellman ----------------
const dh: AlgoDef = {
  id: 'diffie-hellman', name: 'Diffie–Hellman 金鑰交換', en: 'Diffie–Hellman Key Exchange', cat,
  desc: '雙方公開約定質數 p 與底數 g，各自選祕密指數 a、b，只公開 A = gᵃ mod p 與 B = gᵇ mod p。雙方都能算出 s = gᵃᵇ mod p，竊聽者只看到 p、g、A、B，需要解離散對數才能得到 s。交換本身不驗證身分，可能遭中間人攻擊，實務要搭配簽章或憑證。',
  time: 'O(log p) 次乘法', space: 'O(1)',
  code: ['公開：質數 p 與底數 g', 'Alice 選祕密 a，送出 A = g^a mod p', 'Bob 選祕密 b，送出 B = g^b mod p', 'Alice 計算 s = B^a mod p', 'Bob 計算 s = A^b mod p', '兩邊都等於 g^(ab) mod p'],
  inputs: [inNum('p', '質數 p', 23, 5, 2147483647, () => rnd.pick([23, 47, 97, 353, 1019, 7919])), inNum('g', '底數 g', 5, 2, 2147483647, () => rnd.pick([2, 3, 5, 7])), inNum('a', 'Alice 的祕密 a', 6, 1, 1e9, () => rnd.int(2, 200)), inNum('b', 'Bob 的祕密 b', 15, 1, 1e9, () => rnd.int(2, 200))],
  run({ p, g, a, b }) {
    const r = new Rec();
    if (!isPrime(p)) throw new Error('p 必須是質數');
    if (g < 2 || g > p - 2) throw new Error(`g 應介於 2 與 p − 2 = ${p - 2}`);
    const P = BigInt(p);
    const A = powModBig(BigInt(g), BigInt(a), P), B = powModBig(BigInt(g), BigInt(b), P);
    const sa = powModBig(B, BigInt(a), P), sb = powModBig(A, BigInt(b), P);
    const net = (show: { A?: boolean; B?: boolean; s?: boolean }, hl: string[] = []): Panel => {
      const nodes: GNode[] = [
        { id: 'al', x: -200, y: 0, label: 'Alice', shape: 'rect', w: 80, h: 36, color: 'frontier', sub: `a = ${a}`, badge: show.s ? `s = ${sa}` : undefined },
        { id: 'ch', x: 0, y: 0, label: '公開通道', shape: 'rect', w: 96, h: 36, color: 'muted', sub: `p = ${p}, g = ${g}` },
        { id: 'bo', x: 200, y: 0, label: 'Bob', shape: 'rect', w: 80, h: 36, color: 'special', sub: `b = ${b}`, badge: show.s ? `s = ${sb}` : undefined },
      ];
      const edges: GEdge[] = [];
      if (show.A) edges.push({ from: 'al', to: 'ch', label: `A = ${A}`, directed: true, color: hl.includes('A') ? 'active' : undefined });
      if (show.B) edges.push({ from: 'bo', to: 'ch', label: `B = ${B}`, directed: true, color: hl.includes('B') ? 'active' : undefined });
      return { type: 'graph', nodes, edges, title: '紅色為祕密、藍色為公開值', height: 200 };
    };
    const known = (s: boolean) => vars({ p, g, A: String(A), B: String(B), ...(s ? { 共享祕密: String(sa) } : {}) }, '竊聽者看得到的', { A: 'active', B: 'active' });
    r.snap(`公開約定 p = ${p}、g = ${g}`, [net({}), vars({ p, g }, '公開')], 1);
    r.snap(`Alice：A = ${g}^${a} mod ${p} = ${A}`, [net({ A: true }, ['A']), vars({ a }, 'Alice 的祕密', { a: 'bad' })], 2);
    r.snap(`Bob：B = ${g}^${b} mod ${p} = ${B}`, [net({ A: true, B: true }, ['B']), vars({ b }, 'Bob 的祕密', { b: 'bad' })], 3);
    r.snap(`Alice 計算 B^a = ${B}^${a} mod ${p} = ${sa}`, [net({ A: true, B: true }), vars({ s: String(sa) }, 'Alice 算出', { s: 'done' })], 4);
    r.snap(`Bob 計算 A^b = ${A}^${b} mod ${p} = ${sb}`, [net({ A: true, B: true }), vars({ s: String(sb) }, 'Bob 算出', { s: 'done' })], 5);
    r.snap(sa === sb ? `共享祕密一致：s = ${sa}。竊聽者只有 p、g、A、B；但若有人冒充雙方（中間人），這個交換無法察覺` : '共享祕密不一致（不應發生）', [net({ A: true, B: true, s: true }), known(false), vars({ 一致: sa === sb ? '是' : '否' }, undefined, { 一致: sa === sb ? 'done' : 'bad' })], 6);
    return r.frames;
  },
};

// ---------------- AES ----------------
const aesInputs = [inText('key', '金鑰（32 個十六進位字元）', '000102030405060708090a0b0c0d0e0f', () => toHex(Array.from({ length: 16 }, () => rnd.int(0, 255)))), inText('pt', '明文區塊（32 個十六進位字元）', '00112233445566778899aabbccddeeff', () => toHex(Array.from({ length: 16 }, () => rnd.int(0, 255))))];
const aes: AlgoDef = {
  id: 'aes', name: '進階加密標準', en: 'AES-128', cat,
  desc: 'AES 把 16 位元組排成 4×4 狀態矩陣，先與第 0 輪金鑰 XOR，再做 10 輪：SubBytes（S-box 非線性替換）、ShiftRows（第 r 列左移 r 格）、MixColumns（每欄在 GF(2⁸) 上乘固定矩陣，最後一輪省略）、AddRoundKey。預設輸入是 FIPS-197 附錄 C 的已知答案測試。',
  time: '固定 10 輪（每區塊 O(1)）', space: '176 位元組輪金鑰',
  code: ['w = KeyExpansion(key)            (11 把輪金鑰)', 'state = AddRoundKey(pt, w[0])', 'for round in 1..10:', '  state = SubBytes(state)', '  state = ShiftRows(state)', '  if round < 10: state = MixColumns(state)', '  state = AddRoundKey(state, w[round])', 'return state'],
  inputs: aesInputs,
  run({ key, pt }) {
    const r = new Rec();
    const K = fromHex(key, '金鑰'), P = fromHex(pt, '明文');
    if (K.length !== 16) throw new Error('AES-128 金鑰必須是 16 位元組（32 個十六進位字元）');
    if (P.length !== 16) throw new Error('明文區塊必須是 16 位元組');
    const rk = keyExpansion(K);
    r.snap('擴充金鑰：由 16 位元組金鑰推出 11 把輪金鑰（每把 16 位元組）', [table(rk.map((k) => [toHex(k)]), {}, { rowHeaders: rk.map((_, i) => `輪 ${i}`), title: '輪金鑰' })], 1);
    const tr: { step: string; round: number; state: number[] }[] = [];
    const ct = aesEncrypt(P, rk, tr);
    const line: Record<string, number> = { SubBytes: 4, ShiftRows: 5, MixColumns: 6, AddRoundKey: 7 };
    let prev = P;
    r.snap('明文排成 4×4 狀態（由上往下、由左往右填）', [table(stateRows(P), {}, { title: '狀態', w: 'auto' })], 2);
    for (const t of tr) {
      const changed: Record<string, Color> = {};
      t.state.forEach((v, i) => { if (v !== prev[i]) changed[`${i % 4},${Math.floor(i / 4)}`] = 'swap'; });
      const ps: Panel[] = [table(stateRows(prev), {}, { title: '之前', w: 'auto' }), table(stateRows(t.state), changed, { title: `第 ${t.round} 輪 ${t.step} 之後`, w: 'auto' })];
      if (t.step === 'AddRoundKey') ps.push(table(stateRows(rk[t.round]), {}, { title: `輪金鑰 ${t.round}`, w: 'auto' }));
      const msg = { SubBytes: '每個位元組查 S-box 替換', ShiftRows: '第 r 列循環左移 r 格', MixColumns: '每一欄乘上 GF(2⁸) 的固定矩陣', AddRoundKey: '與輪金鑰逐位元組 XOR' }[t.step];
      r.snap(`第 ${t.round} 輪 ${t.step}：${msg}`, ps, t.round === 0 ? 2 : line[t.step]);
      prev = t.state;
    }
    const kat = toHex(K) === '000102030405060708090a0b0c0d0e0f' && toHex(P) === '00112233445566778899aabbccddeeff';
    const ok = toHex(ct) === '69c4e0d86a7b0430d8cdb78070b4c55a';
    const dec = aesDecrypt(ct, rk);
    r.snap(`密文 ${toHex(ct)}` + (kat ? (ok ? '，與 FIPS-197 已知答案相同' : '，與已知答案不符！') : ''), [table(stateRows(ct), {}, { title: '密文', w: 'auto' }), vars({ 密文: toHex(ct), 解密回來: toHex(dec), 往返: toHex(dec) === toHex(P) ? '成功' : '失敗' }, undefined, { 往返: 'done' })], 8);
    return r.frames;
  },
};

// ---------------- CBC / CTR ----------------
const blockModes: AlgoDef = {
  id: 'block-modes', name: 'CBC 與 CTR 區塊模式', en: 'CBC and CTR Modes', cat,
  desc: '區塊密碼一次只加密 16 位元組。CBC 把每個明文區塊先與前一個密文區塊 XOR（第一塊用隨機 IV）再加密，需要 PKCS#7 填充；CTR 把「nonce ∥ 計數器」加密成金鑰流再與明文 XOR，不需填充、可平行，但同一把金鑰下 nonce 絕對不能重複。本頁的 IV／nonce 為示範固定值。',
  time: 'O(區塊數)', space: 'O(n)',
  code: ['CBC：明文做 PKCS#7 填充到 16 的倍數', '  prev = IV', '  for 每個區塊 P_i: C_i = AES(P_i XOR prev)；prev = C_i', '  解密：P_i = AES⁻¹(C_i) XOR C_{i−1}，再移除填充', 'CTR：for i: KS_i = AES(nonce ∥ i)', '  C_i = P_i XOR KS_i（最後一塊只取需要的長度）', '  解密與加密相同'],
  inputs: [inSelect('mode', '模式', [['cbc', 'CBC'], ['ctr', 'CTR']]), inText('pt', '明文', 'Block modes chain AES blocks!', () => rnd.pick(['Attack at dawn, bring snacks.', 'CTR mode needs a unique nonce', 'Hello, block cipher modes'])), inText('key', '金鑰（32 個十六進位字元）', '2b7e151628aed2a6abf7158809cf4f3c'), inText('iv', 'IV（CBC，16 位元組）／nonce（CTR，取前 8 位元組）', '000102030405060708090a0b0c0d0e0f')],
  run({ mode, pt, key, iv }) {
    const r = new Rec();
    const K = fromHex(key, '金鑰'), IV = fromHex(iv, 'IV');
    if (K.length !== 16) throw new Error('金鑰必須是 16 位元組');
    if (IV.length !== 16) throw new Error('IV／nonce 欄位必須是 16 位元組');
    const rk = keyExpansion(K);
    const P = utf8(limitText(pt, 96));
    const blocks = (b: number[]) => Array.from({ length: Math.ceil(b.length / 16) }, (_, i) => b.slice(16 * i, 16 * i + 16));
    if (mode === 'cbc') {
      const padN = 16 - (P.length % 16);
      const padded = [...P, ...new Array(padN).fill(padN)];
      r.snap(`PKCS#7：補 ${padN} 個值為 ${padN} 的位元組（剛好整除時也要補一整塊）`, [table(blocks(padded).map((b) => [toHex(b)]), {}, { rowHeaders: blocks(padded).map((_, i) => `P${i}`), title: '填充後的明文區塊' })], 1);
      let prev = IV;
      const C: number[][] = [];
      blocks(padded).forEach((Pi, i) => {
        const x = Pi.map((v, k) => v ^ prev[k]);
        const Ci = aesEncrypt(x, rk);
        C.push(Ci);
        r.snap(`C${i} = AES(P${i} ⊕ ${i ? 'C' + (i - 1) : 'IV'})`, [table([[toHex(Pi)], [toHex(prev)], [toHex(x)], [toHex(Ci)]], { '3,0': 'done', '1,0': 'compare' }, { rowHeaders: [`P${i}`, i ? `C${i - 1}` : 'IV', 'XOR 後', `C${i}`] }), cells(C.map((_, k) => `C${k}`), {}, { title: '已產生的密文區塊' })], 3);
        prev = Ci;
      });
      const dec: number[] = [];
      prev = IV;
      for (const Ci of C) { dec.push(...aesDecrypt(Ci, rk).map((v, k) => v ^ prev[k])); prev = Ci; }
      const pad = dec[dec.length - 1];
      const ok = pad >= 1 && pad <= 16 && dec.slice(-pad).every((v) => v === pad);
      const plain = new TextDecoder().decode(new Uint8Array(dec.slice(0, dec.length - pad)));
      r.snap(`解密後檢查並移除填充：${ok ? '填充正確' : '填充錯誤'}，得到「${plain}」`, [table(C.map((c) => [toHex(c)]), {}, { rowHeaders: C.map((_, i) => `C${i}`), title: '密文' }), vars({ 往返: plain === pt ? '成功' : '失敗' }, undefined, { 往返: 'done' })], 4);
    } else {
      const nonce = IV.slice(0, 8);
      const C: number[] = [];
      blocks(P).forEach((Pi, i) => {
        const ctr = [...nonce, ...bigToBytes(BigInt(i), 8)];
        const ks = aesEncrypt(ctr, rk).slice(0, Pi.length);
        const Ci = Pi.map((v, k) => v ^ ks[k]);
        C.push(...Ci);
        r.snap(`區塊 ${i}：金鑰流 = AES(nonce ∥ ${i})，與明文 XOR` + (Pi.length < 16 ? `（最後一塊只用 ${Pi.length} 位元組，不需填充）` : ''), [table([[toHex(ctr)], [toHex(ks)], [toHex(Pi)], [toHex(Ci)]], { '3,0': 'done', '1,0': 'compare' }, { rowHeaders: ['計數器區塊', '金鑰流', `P${i}`, `C${i}`] })], i ? 6 : 5);
      });
      const dec = blocks(C).flatMap((Ci, i) => { const ks = aesEncrypt([...nonce, ...bigToBytes(BigInt(i), 8)], rk); return Ci.map((v, k) => v ^ ks[k]); });
      const plain = new TextDecoder().decode(new Uint8Array(dec));
      r.snap(`解密時再產生同樣的金鑰流 XOR 一次，得到「${plain}」。密文長度 ${C.length} 與明文相同`, [text([toHex(C)], '密文'), vars({ 往返: plain === pt ? '成功' : '失敗' }, undefined, { 往返: 'done' })], 7);
    }
    return r.frames;
  },
};

// ---------------- SHA-256 ----------------
const sha: AlgoDef = {
  id: 'sha256', name: 'SHA-256 雜湊', en: 'SHA-256', cat,
  desc: '把訊息補位到 512 位元的倍數（附加 1、補 0、最後 64 位元寫原始長度），每個 512 位元區塊先擴展成 64 個字的訊息排程 W，再用 8 個工作變數 a–h 做 64 輪壓縮，結果加回雜湊值。輸出 256 位元摘要，微小改動會讓輸出完全不同。',
  time: 'O(n)', space: 'O(1)（每區塊 64 字排程）',
  code: ['補位：附加 0x80，補 0 到 ≡ 56 (mod 64)，再附加 64 位元長度', 'for 每個 64 位元組區塊:', '  W[0..15] = 區塊；W[t] = σ1(W[t−2]) + W[t−7] + σ0(W[t−15]) + W[t−16]', '  (a..h) = H', '  for t in 0..63:', '    T1 = h + Σ1(e) + Ch(e,f,g) + K[t] + W[t]；T2 = Σ0(a) + Maj(a,b,c)', '    h=g, g=f, f=e, e=d+T1, d=c, c=b, b=a, a=T1+T2', '  H += (a..h)', '輸出 H0 ∥ … ∥ H7'],
  inputs: [inText('msg', '訊息', 'abc', () => rnd.pick(['', 'abc', 'hello', 'The quick brown fox jumps over the lazy dog']))],
  run({ msg }) {
    const r = new Rec();
    const M = utf8(limitText(msg, 200));
    const tr: ShaTrace = { padded: [], blocks: [] };
    const digest = sha256(M, tr);
    const rows16 = (b: number[]) => Array.from({ length: Math.ceil(b.length / 16) }, (_, i) => b.slice(16 * i, 16 * i + 16).map(hex2));
    const padColors: Record<string, Color> = {};
    tr.padded.forEach((_, i) => { const c: Color = i < M.length ? 'active' : i === M.length ? 'swap' : i >= tr.padded.length - 8 ? 'done' : 'muted'; padColors[`${Math.floor(i / 16)},${i % 16}`] = c; });
    r.snap(`訊息 ${M.length} 位元組 → 補位後 ${tr.padded.length} 位元組（${tr.blocks.length} 個區塊）：藍 = 訊息、橘 = 0x80、綠 = 位元長度 ${M.length * 8}`, [table(rows16(tr.padded), padColors, { title: '補位後的訊息' })], 1);
    const names = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    tr.blocks.forEach((blk, bi) => {
      r.snap(`區塊 ${bi}：擴展出 64 個字的訊息排程 W`, [table(Array.from({ length: 8 }, (_, i) => blk.W.slice(8 * i, 8 * i + 8).map(w32)), Object.fromEntries(Array.from({ length: 16 }, (_, t) => [`${Math.floor(t / 8)},${t % 8}`, 'active' as Color])), { title: 'W[0..63]（藍色 W[0..15] 直接取自區塊）', rowHeaders: Array.from({ length: 8 }, (_, i) => `${8 * i}`) })], 3);
      r.snap('工作變數 a..h 初始化為目前的雜湊值', [table([blk.before.map(w32)], {}, { colHeaders: names })], 4);
      const detail = bi < 2;
      blk.rounds.forEach((st, t) => {
        if (detail ? t < 8 || t % 8 === 7 : t === 63) r.snap(`區塊 ${bi} 第 ${t} 輪：a 與 e 是新算出來的，其餘往右移一格`, [table([st.map(w32)], { '0,0': 'swap', '0,4': 'swap' }, { colHeaders: names }), vars({ t, 'K[t]': w32(SHA_K[t]), 'W[t]': w32(blk.W[t]) })], t === 0 ? 5 : 7);
      });
      r.snap(`區塊 ${bi} 結束：H += (a..h)`, [table([blk.before.map(w32), blk.rounds[63].map(w32), blk.after.map(w32)], Object.fromEntries(names.map((_, i) => [`2,${i}`, 'done' as Color])), { rowHeaders: ['原 H', '+ a..h', '新 H'], colHeaders: names })], 8);
    });
    const hexd = toHex(digest);
    const known: Record<string, string> = { '': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', abc: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad' };
    r.snap(`SHA-256 = ${hexd}` + (msg in known ? (known[msg] === hexd ? '（與標準測試向量相同）' : '（與標準不符！）') : ''), [text([hexd], '摘要'), vars({ 位元數: 256 })], 9);
    return r.frames;
  },
};

// ---------------- HMAC ----------------
const hmac: AlgoDef = {
  id: 'hmac', name: '金鑰式訊息驗證碼', en: 'HMAC-SHA256', cat,
  desc: 'HMAC(K, m) = H((K₀ ⊕ opad) ∥ H((K₀ ⊕ ipad) ∥ m))。K₀ 是把金鑰補 0 到區塊長度 64 位元組（太長先雜湊），ipad = 0x36…、opad = 0x5c…。內外兩層雜湊避免了直接 H(K ∥ m) 的長度延伸攻擊；收到訊息時重算 MAC 比對，任何改動都會驗證失敗。',
  time: 'O(n)（兩次 SHA-256）', space: 'O(1)',
  code: ['K0 = |K| > 64 ? SHA256(K) : K，再補 0 到 64 位元組', 'inner = SHA256((K0 ⊕ 0x36…) ∥ m)', 'mac = SHA256((K0 ⊕ 0x5c…) ∥ inner)', '驗證：重算 mac′ 並以固定時間比較 mac′ == mac'],
  inputs: [inText('key', '金鑰', 'key', () => rnd.pick(['key', 'secret', 'Jefe'])), inText('msg', '訊息', 'The quick brown fox jumps over the lazy dog', () => rnd.pick(['hello', 'what do ya want for nothing?', 'transfer 100 to bob'])), inText('tamper', '收到的訊息（可修改看看）', 'The quick brown fox jumps over the lazy cog')],
  run({ key, msg, tamper }) {
    const r = new Rec();
    const K = utf8(limitText(key, 100)), M = utf8(limitText(msg, 200));
    const h = hmacSha256(K, M);
    const rows = (b: number[]) => Array.from({ length: 4 }, (_, i) => b.slice(16 * i, 16 * i + 16).map(hex2));
    r.snap(`K0：金鑰 ${K.length} 位元組${K.length > 64 ? '，超過 64 先雜湊' : '，補 0 到 64 位元組'}`, [table(rows(h.k0), {}, { title: 'K0' })], 1);
    r.snap('K0 ⊕ ipad（0x36）接上訊息後做內層雜湊', [table(rows(h.ipad), {}, { title: 'K0 ⊕ ipad', w: 'half' }), text([toHex(h.inner)], '內層雜湊')], 2);
    r.snap('K0 ⊕ opad（0x5c）接上內層雜湊後做外層雜湊', [table(rows(h.opad), {}, { title: 'K0 ⊕ opad', w: 'half' }), text([toHex(h.mac)], 'HMAC')], 3);
    const recv = utf8(limitText(tamper, 200));
    const mac2 = hmacSha256(K, recv).mac;
    const ok = toHex(mac2) === toHex(h.mac);
    r.snap(ok ? '收到的訊息重算 MAC 與附帶的 MAC 相同：驗證通過' : '收到的訊息被改過：重算的 MAC 完全不同，驗證失敗', [table([[toHex(h.mac)], [toHex(mac2)]], { '1,0': ok ? 'done' : 'bad' }, { rowHeaders: ['附帶的 MAC', '重算的 MAC'] }), vars({ 結果: ok ? '通過' : '拒絕' }, undefined, { 結果: ok ? 'done' : 'bad' })], 4);
    const wrong = hmacSha256(utf8(key + '!'), M).mac;
    r.snap('攻擊者不知道金鑰：用錯的金鑰算出的 MAC 也對不上', [table([[toHex(h.mac)], [toHex(wrong)]], { '1,0': 'bad' }, { rowHeaders: ['正確 MAC', `金鑰「${key}!」`] })], 4);
    return r.frames;
  },
};

// ---------------- RSA-PSS ----------------
const WRONG_N = DEMO_RSA.p * 104647222435860624031927343080258704984975650564940700544221407903667366866719n;
const pss: AlgoDef = {
  id: 'rsa-signature', name: 'RSA-PSS 數位簽章', en: 'RSA-PSS Signature', cat,
  desc: '簽章不是「用私鑰加密」：PSS 先雜湊訊息，再混入隨機 salt 並用 MGF1 遮罩編碼成 EM，最後 s = EMᵈ mod n。任何人都能用公鑰算出 EM′ = sᵉ mod n，拆解遮罩並重算雜湊比對。本頁用 512 位元示範金鑰、SHA-256、salt 16 位元組；實務至少 2048 位元。',
  time: '簽章 O(log d)、驗證 O(log e) 次大數乘法', space: 'O(n 的位元數)',
  code: ['mHash = SHA256(M)', "M' = 0x00×8 ∥ mHash ∥ salt；H = SHA256(M')", 'DB = 0x00…00 ∥ 0x01 ∥ salt', 'maskedDB = DB ⊕ MGF1(H)，清掉最高位元', 'EM = maskedDB ∥ H ∥ 0xbc', 's = EM^d mod n                     (簽章)', "驗證：EM' = s^e mod n，檢查 0xbc、還原 DB 與 salt", "  重算 H' 並比較 H' == H"],
  inputs: [inText('msg', '要簽的訊息', 'Pay Bob 100 coins', () => rnd.pick(['I agree to the terms', 'Release v2.0', 'Pay Bob 100 coins'])), inSelect('check', '驗證情境', [['ok', '原訊息＋正確公鑰'], ['tamper', '訊息遭竄改'], ['wrongkey', '使用別人的公鑰']]), inSeed()],
  run({ msg, check, seed }) {
    const r = new Rec();
    const n = DEMO_RSA.n, e = DEMO_RSA.e, d = DEMO_RSA.d;
    const emBits = 511, emLen = 64, hLen = 32, sLen = 16;
    const M = utf8(limitText(msg, 200));
    const g = parkMiller(seed);
    const salt = Array.from({ length: sLen }, () => g.int(256));
    const mHash = sha256(M);
    r.snap('第 1 步：先雜湊訊息', [table([[toHex(M).slice(0, 64)], [toHex(mHash)]], { '1,0': 'active' }, { rowHeaders: ['M（hex）', 'mHash'] })], 1);
    const H = sha256([...new Array(8).fill(0), ...mHash, ...salt]);
    r.snap(`第 2 步：混入 ${sLen} 位元組 salt（種子 ${seed}），H = SHA256(0⁸ ∥ mHash ∥ salt)`, [table([[toHex(salt)], [toHex(H)]], { '1,0': 'active' }, { rowHeaders: ['salt', 'H'] })], 2);
    const DB = [...new Array(emLen - sLen - hLen - 2).fill(0), 1, ...salt];
    const mask = mgf1(H, emLen - hLen - 1);
    const masked = DB.map((b, i) => b ^ mask[i]);
    masked[0] &= 0xff >> (8 * emLen - emBits);
    r.snap('第 3–4 步：DB = 0…0 ∥ 01 ∥ salt，與 MGF1(H) 產生的遮罩 XOR', [table([[toHex(DB)], [toHex(mask)], [toHex(masked)]], { '2,0': 'active' }, { rowHeaders: ['DB', 'MGF1(H)', 'maskedDB'] })], 4);
    const EM = [...masked, ...H, 0xbc];
    r.snap('第 5 步：EM = maskedDB ∥ H ∥ 0xbc（64 位元組）', [text([toHex(EM)], 'EM')], 5);
    const s = powModBig(bytesToBig(EM), d, n);
    r.snap('第 6 步：用私鑰 d 簽章 s = EM^d mod n', [text([s.toString(16)], '簽章 s（hex）'), vars({ n: `${n.toString(16).slice(0, 16)}…（512 位元）`, e: String(e) })], 6);
    const vMsg = check === 'tamper' ? utf8(msg + '0') : M;
    const vn = check === 'wrongkey' ? WRONG_N : n;
    const em2 = bigToBytes(powModBig(s % vn, e, vn), emLen);
    const fail = (why: string) => { r.snap(`驗證失敗：${why}`, [text([toHex(em2)], "EM'"), vars({ 結果: '拒絕' }, undefined, { 結果: 'bad' })], 7); return r.frames; };
    r.snap(check === 'wrongkey' ? '用「別人的公鑰」算 EM′ = s^e mod n′' : `驗證者用公鑰算 EM′ = s^e mod n` + (check === 'tamper' ? `，但收到的訊息是「${msg}0」` : ''), [text([toHex(em2)], "EM'")], 7);
    if (em2[emLen - 1] !== 0xbc) return fail(`最後一個位元組是 0x${hex2(em2[emLen - 1])}，不是 0xbc`);
    const H2 = em2.slice(emLen - hLen - 1, emLen - 1);
    const DB2 = em2.slice(0, emLen - hLen - 1).map((b, i) => b ^ mgf1(H2, emLen - hLen - 1)[i]);
    DB2[0] &= 0xff >> (8 * emLen - emBits);
    const ps = DB2.slice(0, emLen - sLen - hLen - 2);
    if (ps.some((b) => b) || DB2[emLen - sLen - hLen - 2] !== 1) return fail('還原的 DB 開頭不是 0…0 ∥ 01');
    const salt2 = DB2.slice(-sLen);
    const H3 = sha256([...new Array(8).fill(0), ...sha256(vMsg), ...salt2]);
    const ok = toHex(H3) === toHex(H2);
    r.snap(ok ? "還原出 salt 並重算 H'，與 EM 中的 H 相同：簽章有效" : "結構正確，但重算的 H' 與 EM 中的 H 不同：訊息被竄改", [table([[toHex(salt2)], [toHex(H2)], [toHex(H3)]], { '2,0': ok ? 'done' : 'bad' }, { rowHeaders: ['還原的 salt', 'EM 中的 H', "重算的 H'"] }), vars({ 結果: ok ? '有效' : '拒絕' }, undefined, { 結果: ok ? 'done' : 'bad' })], 8);
    return r.frames;
  },
};

export default [caesar, vigenere, affine, railFence, columnar, playfair, freqAnalysis, otp, hill, rsa, dh, aes, blockModes, sha, hmac, pss] satisfies AlgoDef[];
