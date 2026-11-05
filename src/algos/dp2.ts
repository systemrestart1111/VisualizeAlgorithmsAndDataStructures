// 擴充的動態規劃與最佳化技巧
import type { AlgoDef, CMap, Color, PlotPanel } from '../core/types';
import { Rec, bars, cells, inArr, inNum, inText, range, rnd, table, vars } from '../core/helpers';
import { binaryPanel, type BNode } from '../core/graph';

const cat = 'dp';
const WORDS = ['apple', 'pen', 'applepen', 'pine', 'pineapple', 'cats', 'dog', 'sand', 'and', 'cat'];

// ---------------- 加權區間排程 ----------------
const weightedInterval: AlgoDef = {
  id: 'weighted-interval-scheduling', name: '加權區間排程', en: 'Weighted Interval Scheduling', cat,
  desc: '每個活動有開始、結束時間與收益，選出互不重疊且總收益最大的一組。依結束時間排序後，p(j) 是結束不晚於第 j 個開始時間的最後一個活動（二分搜尋）。dp[j] = max(不選：dp[j−1]，選：w_j + dp[p(j)])。只看「最早結束」的貪婪法在有權重時會出錯，頁面會同時列出反例的結果。',
  time: 'O(n log n)', space: 'O(n)',
  code: ['依結束時間排序', 'for j = 1..n: p(j) = 結束 ≤ s_j 的最後一個活動（二分搜尋）', 'dp[0] = 0', 'for j = 1..n:', '  dp[j] = max(dp[j−1], w_j + dp[p(j)])', '從 dp[n] 回溯：dp[j] ≠ dp[j−1] 代表選了 j，跳到 p(j)'],
  inputs: [inText('iv', '活動（每組 開始 結束 收益，以 ; 分隔）', '0 3 2; 2 9 20; 3 5 3; 5 7 4; 7 10 3; 9 12 6; 10 14 2', () => Array.from({ length: 8 }, () => { const s = rnd.int(0, 10); return `${s} ${s + rnd.int(1, 5)} ${rnd.int(1, 9)}`; }).join('; '))],
  run({ iv }) {
    const r = new Rec();
    const A = String(iv).split(';').map((s) => s.trim()).filter(Boolean).map((s) => s.split(/\s+/).map(Number)).map(([s, e, w], i) => { if ([s, e, w].some((x) => !Number.isFinite(x)) || e <= s) throw new Error(`第 ${i + 1} 組活動格式錯誤（需 開始 < 結束）`); return { s, e, w, id: i }; });
    if (!A.length) throw new Error('請輸入活動');
    const S = [...A].sort((a, b) => a.e - b.e || a.s - b.s);
    const n = S.length;
    const p = S.map((x) => { let lo = 0, hi = n - 1, ans = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (S[m].e <= x.s) { ans = m; lo = m + 1; } else hi = m - 1; } return ans; });
    const dp: (number | null)[] = [0, ...new Array(n).fill(null)];
    const lo = Math.min(...S.map((x) => x.s)), hi = Math.max(...S.map((x) => x.e));
    const plot = (hl: Record<number, Color>): PlotPanel => ({ type: 'plot', title: '依結束時間排序的活動（線段上方為收益）', bounds: [lo - 0.5, hi + 0.5, 0, n + 1], height: 260, segments: S.map((x, j) => ({ x1: x.s, y1: n - j, x2: x.e, y2: n - j, color: hl[j] ?? ('muted' as Color), width: 7 })), points: S.map((x, j) => ({ x: (x.s + x.e) / 2, y: n - j, r: 0.1, label: `#${j + 1} w=${x.w}` })), axes: true });
    r.snap('依結束時間排序並用二分搜尋算出 p(j)', [plot({}), table(S.map((x, j) => [j + 1, `[${x.s}, ${x.e})`, x.w, p[j] + 1 || 0]), {}, { colHeaders: ['j', '區間', 'w', 'p(j)'], w: 'half' })], 2);
    for (let j = 1; j <= n; j++) {
      const take = S[j - 1].w + (dp[p[j - 1] + 1] as number), skip = dp[j - 1] as number;
      dp[j] = Math.max(take, skip);
      r.snap(`dp[${j}] = max(不選 ${skip}, 選 ${S[j - 1].w} + dp[${p[j - 1] + 1}] = ${take}) = ${dp[j]}`, [plot({ [j - 1]: 'active', ...(p[j - 1] >= 0 ? { [p[j - 1]]: 'compare' } : {}) }), cells(dp, { [j]: 'done', [j - 1]: 'compare', [p[j - 1] + 1]: 'compare' }, { title: 'dp' })], 5);
    }
    const pick: number[] = [];
    for (let j = n; j > 0;) { if (dp[j] !== dp[j - 1]) { pick.push(j - 1); j = p[j - 1] + 1; } else j--; }
    // 反例：最早結束貪婪
    const greedy: number[] = [];
    let last = -Infinity;
    S.forEach((x, j) => { if (x.s >= last) { greedy.push(j); last = x.e; } });
    const gw = greedy.reduce((s, j) => s + S[j].w, 0);
    r.snap(`最佳總收益 ${dp[n]}：選 ${pick.reverse().map((j) => `#${j + 1}`).join('、')}。「最早結束」貪婪只得到 ${gw}${gw < (dp[n] as number) ? '，有權重時貪婪不正確' : ''}`, [plot(Object.fromEntries([...greedy.map((j) => [j, 'special' as Color]), ...pick.map((j) => [j, 'done' as Color])])), vars({ 動態規劃: dp[n], 貪婪: gw }, undefined, { 動態規劃: 'done', 貪婪: gw < (dp[n] as number) ? 'bad' : 'done' })], 6);
    return r.frames;
  },
};

// ---------------- 鋼條切割 ----------------
const rodCutting: AlgoDef = {
  id: 'rod-cutting', name: '鋼條切割', en: 'Rod Cutting', cat,
  desc: '長度 i 的鋼條售價 p[i]，求把長度 n 的鋼條切成若干段的最大收益。枚舉第一段的長度 k：dp[i] = max(p[k] + dp[i − k])，並記錄最佳的 k 以回溯切法。結果與枚舉所有 2^(n−1) 種切法的答案比對。',
  time: 'O(n²)', space: 'O(n)',
  code: ['dp[0] = 0', 'for i = 1..n:', '  for k = 1..i:', '    if p[k] + dp[i − k] > dp[i]: dp[i] = p[k] + dp[i − k]；cut[i] = k', '回溯：while n > 0: 輸出 cut[n]；n −= cut[n]'],
  inputs: [inArr([1, 5, 8, 9, 10, 17, 17, 20], '售價 p[1..n]', 8, 1, 30)],
  run({ arr: p }) {
    const r = new Rec();
    const n = p.length;
    if (!n || n > 16) throw new Error('長度需介於 1 與 16');
    const dp: (number | null)[] = [0, ...new Array(n).fill(null)];
    const cut: (number | null)[] = [null, ...new Array(n).fill(null)];
    r.snap('dp[0] = 0', [bars(p, {}, { labels: p.map((x: number, i: number) => `L${i + 1}:${x}`), title: '各長度售價' }), cells(dp, { 0: 'done' }, { title: 'dp（最大收益）' })], 1);
    for (let i = 1; i <= n; i++) {
      let best = -Infinity, bk = 1;
      for (let k = 1; k <= i; k++) {
        const v = p[k - 1] + (dp[i - k] as number);
        if (v > best) { best = v; bk = k; }
      }
      dp[i] = best; cut[i] = bk;
      r.snap(`dp[${i}] = 最大值，第一段長 ${bk}：p[${bk}] + dp[${i - bk}] = ${p[bk - 1]} + ${dp[i - bk]} = ${best}`, [bars(p, { [bk - 1]: 'active' }, { labels: p.map((x: number, j: number) => `L${j + 1}:${x}`), title: '各長度售價' }), cells(dp, { [i]: 'done', [i - bk]: 'compare' }, { title: 'dp（最大收益）' }), cells(cut, {}, { title: '最佳第一段 cut' })], 4);
    }
    const parts: number[] = [];
    for (let m = n; m > 0; m -= cut[m] as number) parts.push(cut[m] as number);
    let brute = 0;
    for (let mask = 0; mask < 1 << (n - 1); mask++) { let s = 0, len = 1; for (let i = 0; i < n - 1; i++) { if (mask >> i & 1) { s += p[len - 1]; len = 1; } else len++; } s += p[len - 1]; brute = Math.max(brute, s); }
    r.snap(`最大收益 ${dp[n]}：切成 ${parts.join(' + ')}；枚舉 2^${n - 1} 種切法得到 ${brute}${brute === dp[n] ? '，一致' : '，不一致！'}`, [cells(dp, { [n]: 'done' }, { title: 'dp' }), vars({ 切法: parts.join(' + '), 收益: dp[n] })], 5);
    return r.frames;
  },
};

// ---------------- 單字拆分 ----------------
const wordBreak: AlgoDef = {
  id: 'word-break', name: '單字拆分', en: 'Word Break', cat,
  desc: '判斷字串能否切成字典裡的單字，並計算切法數。dp[i] 表示前 i 個字元可以被切完的方法數，dp[0] = 1（空字串視為可切，且只有一種切法）。從每個可到達的位置 i 沿字典樹往後比對，所有落在單字結尾的位置 j 都加上 dp[i]。單字可以重複使用。',
  time: 'O(n · L)（L 為最長單字長度）', space: 'O(n + 字典總長)',
  code: ['把字典建成字典樹', 'dp[0] = 1', 'for i = 0..n−1:', '  if dp[i] == 0: continue', '  沿字典樹比對 s[i..]：每遇到單字結尾 j：dp[j] += dp[i]', 'dp[n] > 0 代表可以拆分，值為切法數'],
  inputs: [inText('s', '字串', 'pineapplepenapple', () => rnd.pick(['catsanddog', 'pineapplepenapple', 'applepenapple', 'catsandog', 'penpineapple'])), inText('dict', '字典（空白分隔）', WORDS.join(' '))],
  run({ s, dict }) {
    const r = new Rec();
    const str = String(s).trim();
    if (str.length > 40) throw new Error('字串最多 40 個字元');
    const words = [...new Set(String(dict).split(/[\s,]+/).filter(Boolean))];
    const trie: { k: Map<string, number>; end: string | null }[] = [{ k: new Map(), end: null }];
    for (const w of words) { let u = 0; for (const ch of w) { if (!trie[u].k.has(ch)) { trie[u].k.set(ch, trie.length); trie.push({ k: new Map(), end: null }); } u = trie[u].k.get(ch)!; } trie[u].end = w; }
    const n = str.length;
    const dp = new Array(n + 1).fill(0);
    const from: { from: number; w: string }[][] = Array.from({ length: n + 1 }, () => []);
    dp[0] = 1;
    const view = (i: number, hl: CMap, msg: string, line: number) => r.snap(msg, [cells(str.split(''), Object.fromEntries(Object.entries(hl).filter(([k]) => +k < n)), { title: '字串', headers: str.split('').map((_, k) => k) }), cells(dp, { ...Object.fromEntries(dp.map((v, k) => [k, v ? 'visited' as Color : undefined])), [i]: 'active', ...hl }, { title: 'dp（切法數，位置 = 已切完的字元數）' })], line);
    view(0, {}, 'dp[0] = 1：空字串有一種切法', 2);
    for (let i = 0; i < n; i++) {
      if (!dp[i]) continue;
      let u = 0;
      const ends: string[] = [];
      let far = i;
      for (let j = i; j < n && trie[u].k.has(str[j]); j++) {
        u = trie[u].k.get(str[j])!;
        if (trie[u].end) { dp[j + 1] += dp[i]; from[j + 1].push({ from: i, w: trie[u].end! }); ends.push(`「${trie[u].end}」→ dp[${j + 1}]`); far = j + 1; }
      }
      view(i, range(i, far - 1, 'compare'), ends.length ? `從位置 ${i} 出發找到單字 ${ends.join('、')}，各加上 dp[${i}] = ${dp[i]}` : `從位置 ${i} 出發沒有任何單字`, 4);
    }
    if (!dp[n]) { view(n, { [n]: 'bad' }, `dp[${n}] = 0：無法拆分`, 5); return r.frames; }
    const one: string[] = [];
    for (let j = n; j > 0;) { const f = from[j].find((x) => dp[x.from] > 0)!; one.unshift(f.w); j = f.from; }
    view(n, { [n]: 'done' }, `可以拆分，共 ${dp[n]} 種切法，例如：${one.join(' ')}`, 5);
    return r.frames;
  },
};

// ---------------- 最長共同子字串 ----------------
const lcsubstr: AlgoDef = {
  id: 'longest-common-substring', name: '最長共同子字串', en: 'Longest Common Substring', cat,
  desc: '子字串必須連續。dp[i][j] 表示以 a[i−1] 與 b[j−1] 結尾的最長共同子字串長度：字元相同就沿對角線延伸 dp[i−1][j−1] + 1，不同就歸零。表中的最大值就是答案。與「最長共同子序列」不同，子序列允許跳過字元，因此結果通常更長。',
  time: 'O(nm)', space: 'O(nm)（可壓成 O(m)）',
  code: ['dp 為 (n+1)×(m+1) 零矩陣，best = 0', 'for i = 1..n:', '  for j = 1..m:', '    if a[i−1] == b[j−1]: dp[i][j] = dp[i−1][j−1] + 1', '    else: dp[i][j] = 0              (連續性中斷)', '    更新 best 與結尾位置', '答案 = a[end − best .. end)'],
  inputs: [inText('a', '字串 a', 'ABABCABA'), inText('b', '字串 b', 'BABCAACB', () => rnd.pick(['BABCAACB', 'CABAB', 'XABCAB']))],
  run({ a, b }) {
    const r = new Rec();
    const A = String(a), B = String(b);
    if (A.length > 14 || B.length > 14) throw new Error('字串最多 14 個字元');
    const n = A.length, m = B.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    let best = 0, end = 0;
    const show = (i: number, j: number, msg: string, line: number) => {
      const c: Record<string, Color> = {};
      for (let x = 1; x <= n; x++) for (let y = 1; y <= m; y++) if (dp[x][y]) c[`${x},${y}`] = 'visited';
      if (i) { c[`${i},${j}`] = 'active'; if (dp[i][j]) c[`${i - 1},${j - 1}`] = 'compare'; }
      r.snap(msg, [table(dp, c, { rowHeaders: ['', ...A.split('')], colHeaders: ['', ...B.split('')] }), vars({ best, 結尾: end, 目前最長: A.slice(end - best, end) || '—' })], line);
    };
    show(0, 0, '初始化為 0', 1);
    for (let i = 1; i <= n; i++)
      for (let j = 1; j <= m; j++) {
        dp[i][j] = A[i - 1] === B[j - 1] ? dp[i - 1][j - 1] + 1 : 0;
        if (dp[i][j] > best) { best = dp[i][j]; end = i; }
        if (A[i - 1] === B[j - 1] || j === m) show(i, j, A[i - 1] === B[j - 1] ? `${A[i - 1]} = ${B[j - 1]}：沿對角線延伸，dp[${i}][${j}] = ${dp[i][j]}` : `第 ${i} 列完成（不同字元處歸零）`, A[i - 1] === B[j - 1] ? 4 : 5);
      }
    const L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) L[i][j] = A[i - 1] === B[j - 1] ? L[i - 1][j - 1] + 1 : Math.max(L[i - 1][j], L[i][j - 1]);
    const c: Record<string, Color> = {};
    for (let k = 0; k < best; k++) c[`${end - k},${dp[end].indexOf(best) - k}`] = 'done';
    r.snap(`最長共同子字串「${A.slice(end - best, end)}」長度 ${best}；作為對照，最長共同子序列長度為 ${L[n][m]}（不要求連續）`, [table(dp, c, { rowHeaders: ['', ...A.split('')], colHeaders: ['', ...B.split('')] }), vars({ 子字串: best, 子序列: L[n][m] })], 7);
    return r.frames;
  },
};

// ---------------- 最長回文子序列 ----------------
const lps: AlgoDef = {
  id: 'longest-palindromic-subsequence', name: '最長回文子序列', en: 'Longest Palindromic Subsequence', cat,
  desc: '子序列不要求連續。區間 DP：L[i][j] 是 s[i..j] 中最長回文子序列的長度。兩端相同時可以同時取用：L[i][j] = L[i+1][j−1] + 2；不同時至少捨棄一端：max(L[i+1][j], L[i][j−1])。依區間長度由短到長計算。注意這和 Manacher 求的「最長回文子字串」（必須連續）不同。',
  time: 'O(n²)', space: 'O(n²)',
  code: ['L[i][i] = 1', 'for len = 2..n:', '  for i = 0..n−len：j = i + len − 1', '    if s[i] == s[j]: L[i][j] = L[i+1][j−1] + 2', '    else: L[i][j] = max(L[i+1][j], L[i][j−1])', '答案 L[0][n−1]，沿選擇回溯出一個回文'],
  inputs: [inText('s', '字串', 'BBABCBCAB', () => rnd.pick(['BBABCBCAB', 'CHARACTER', 'AGBDBA', 'RACECARX']))],
  run({ s }) {
    const r = new Rec();
    const S = String(s);
    const n = S.length;
    if (!n || n > 14) throw new Error('字串長度需介於 1 與 14');
    const L: (number | null)[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : j < i ? 0 : null)));
    const show = (i: number, j: number, msg: string, line: number) => r.snap(msg, [cells(S.split(''), i >= 0 ? { [i]: 'active', [j]: 'active' } : {}, { title: '字串' }), table(L.map((row, x) => row.map((v, y) => (y < x ? '' : v))), i >= 0 ? { [`${i},${j}`]: 'done', [`${i + 1},${j - 1}`]: S[i] === S[j] ? 'compare' : undefined, [`${i + 1},${j}`]: S[i] !== S[j] ? 'compare' : undefined, [`${i},${j - 1}`]: S[i] !== S[j] ? 'compare' : undefined } : {}, { rowHeaders: S.split(''), colHeaders: S.split(''), title: 'L[i][j]' })], line);
    show(-1, -1, '長度 1 的區間：L[i][i] = 1', 1);
    for (let len = 2; len <= n; len++)
      for (let i = 0; i + len - 1 < n; i++) {
        const j = i + len - 1;
        L[i][j] = S[i] === S[j] ? (len === 2 ? 2 : (L[i + 1][j - 1] as number) + 2) : Math.max(L[i + 1][j] as number, L[i][j - 1] as number);
        show(i, j, S[i] === S[j] ? `s[${i}] = s[${j}] = ${S[i]}：兩端都取，L = ${L[i][j]}` : `s[${i}] ≠ s[${j}]：捨棄一端，L = ${L[i][j]}`, S[i] === S[j] ? 4 : 5);
      }
    let i = 0, j = n - 1;
    const left: string[] = [], right: string[] = [];
    while (i <= j) {
      if (i === j) { left.push(S[i]); break; }
      if (S[i] === S[j]) { left.push(S[i]); right.unshift(S[j]); i++; j--; }
      else if ((L[i + 1][j] as number) >= (L[i][j - 1] as number)) i++;
      else j--;
    }
    const pal = [...left, ...right].join('');
    show(0, n - 1, `最長回文子序列長度 ${L[0][n - 1]}，例如「${pal}」`, 6);
    return r.frames;
  },
};

// ---------------- 回文分割 ----------------
const palPartition: AlgoDef = {
  id: 'palindrome-partition', name: '回文分割最少切割', en: 'Palindrome Partitioning DP', cat,
  desc: '把字串切成若干段，每段都是回文，求最少切幾刀。先用區間 DP 預算 isPal[i][j]（兩端相同且內部是回文），再算 cut[j] = s[0..j] 的最少切割數：若 s[0..j] 本身是回文為 0，否則取 min(cut[i−1] + 1)，其中 s[i..j] 是回文。整串是回文時答案為 0；空字串也是 0。',
  time: 'O(n²)', space: 'O(n²)',
  code: ['isPal[i][j] = s[i] == s[j] and (j − i < 2 or isPal[i+1][j−1])', 'for j = 0..n−1:', '  if isPal[0][j]: cut[j] = 0；continue', '  cut[j] = min(cut[i−1] + 1)，對所有 isPal[i][j] 的 i ≥ 1', '回溯切點得到每一段'],
  inputs: [inText('s', '字串', 'aabbcbbdd', () => rnd.pick(['aab', 'aabbcbbdd', 'racecarannakayak', 'abcde', 'noonabbad']))],
  run({ s }) {
    const r = new Rec();
    const S = String(s);
    const n = S.length;
    if (n > 18) throw new Error('字串最多 18 個字元');
    if (!n) { r.snap('空字串不需要切，答案 0', [vars({ 最少切割: 0 })], 2); return r.frames; }
    const P = Array.from({ length: n }, () => new Array(n).fill(false));
    for (let len = 1; len <= n; len++) for (let i = 0; i + len - 1 < n; i++) { const j = i + len - 1; P[i][j] = S[i] === S[j] && (len < 3 || P[i + 1][j - 1]); }
    r.snap('預算每個區間是否為回文（綠色為回文）', [table(P.map((row, i) => row.map((v, j) => (j < i ? '' : v ? '✓' : ''))), Object.fromEntries(P.flatMap((row, i) => row.map((v, j) => [`${i},${j}`, v && j >= i ? 'done' as Color : undefined]))), { rowHeaders: S.split(''), colHeaders: S.split(''), title: 'isPal[i][j]' })], 1);
    const cut: (number | null)[] = new Array(n).fill(null), prev: number[] = new Array(n).fill(-1);
    for (let j = 0; j < n; j++) {
      if (P[0][j]) { cut[j] = 0; prev[j] = 0; r.snap(`s[0..${j}] = 「${S.slice(0, j + 1)}」本身是回文：cut[${j}] = 0`, [cells(S.split(''), range(0, j, 'done')), cells(cut, { [j]: 'done' }, { title: 'cut' })], 3); continue; }
      let best = Infinity, bi = -1;
      for (let i = 1; i <= j; i++) if (P[i][j] && (cut[i - 1] as number) + 1 < best) { best = (cut[i - 1] as number) + 1; bi = i; }
      cut[j] = best; prev[j] = bi;
      r.snap(`cut[${j}] = cut[${bi - 1}] + 1 = ${best}（最後一段「${S.slice(bi, j + 1)}」是回文）`, [cells(S.split(''), { ...range(0, bi - 1, 'visited'), ...range(bi, j, 'active') }), cells(cut, { [j]: 'done', [bi - 1]: 'compare' }, { title: 'cut' })], 4);
    }
    const parts: string[] = [];
    for (let j = n - 1; j >= 0; j = prev[j] - 1) parts.unshift(S.slice(prev[j], j + 1));
    r.snap(`最少切 ${cut[n - 1]} 刀：${parts.join(' | ')}`, [cells(parts, Object.fromEntries(parts.map((_, i) => [i, 'done' as Color])), { title: '分割結果' }), vars({ 最少切割: cut[n - 1] })], 5);
    return r.frames;
  },
};

// ---------------- 最佳二元搜尋樹 ----------------
const optimalBst: AlgoDef = {
  id: 'optimal-bst', name: '最佳二元搜尋樹', en: 'Optimal BST', cat,
  desc: '已知每個鍵被搜尋的頻率 p_i，以及搜尋落在鍵之間（失敗）的頻率 q_i，建出期望比較次數最小的二元搜尋樹。e[i][j] 是鍵 i..j 子樹的最小成本，枚舉根 r：e[i][j] = min(e[i][r−1] + e[r+1][j]) + w(i, j)，w 為區間內所有頻率和（整棵子樹深一層的代價）。失敗頻率全設 0 就是只考慮成功搜尋的版本。',
  time: 'O(n³)', space: 'O(n²)',
  code: ['e[i][i−1] = q_{i−1}，w[i][i−1] = q_{i−1}', 'for len = 1..n:', '  for i：j = i + len − 1', '    w[i][j] = w[i][j−1] + p_j + q_j', '    for r = i..j: t = e[i][r−1] + e[r+1][j] + w[i][j]', '      取最小的 t 為 e[i][j]，root[i][j] = r', '由 root 表遞迴建出樹'],
  inputs: [inText('keys', '鍵（遞增）', '10 20 30 40 50'), inText('p', '成功頻率 p₁..pₙ', '15 10 5 10 20'), inText('q', '失敗頻率 q₀..qₙ（n+1 個，可全為 0）', '5 10 5 5 5 10')],
  run({ keys, p, q }) {
    const r = new Rec();
    const K = String(keys).split(/[\s,]+/).filter(Boolean).map(Number), P = String(p).split(/[\s,]+/).filter(Boolean).map(Number), Q = String(q).split(/[\s,]+/).filter(Boolean).map(Number);
    const n = K.length;
    if (!n || n > 8) throw new Error('鍵的個數需介於 1 與 8');
    if (P.length !== n || Q.length !== n + 1) throw new Error(`需要 ${n} 個成功頻率與 ${n + 1} 個失敗頻率`);
    if (K.some((k, i) => i && K[i - 1] >= k)) throw new Error('鍵必須遞增');
    const e = Array.from({ length: n + 2 }, () => new Array(n + 1).fill(0));
    const w = Array.from({ length: n + 2 }, () => new Array(n + 1).fill(0));
    const root = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= n + 1; i++) { e[i][i - 1] = Q[i - 1]; w[i][i - 1] = Q[i - 1]; }
    const show = (hi: number, hj: number, msg: string, line: number) => r.snap(msg, [table(Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (j < i ? '' : e[i + 1][j + 1] || ''))), hi ? { [`${hi - 1},${hj - 1}`]: 'done' } : {}, { rowHeaders: K.map((k) => `從 ${k}`), colHeaders: K.map((k) => `到 ${k}`), title: 'e[i][j]：子樹最小期望成本', w: 'half' }), table(Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (j < i || !root[i + 1][j + 1] ? '' : K[root[i + 1][j + 1] - 1]))), {}, { rowHeaders: K.map((k) => `從 ${k}`), colHeaders: K.map((k) => `到 ${k}`), title: 'root[i][j]', w: 'half' })], line);
    show(0, 0, '空子樹的成本就是失敗頻率 q', 1);
    for (let len = 1; len <= n; len++)
      for (let i = 1; i + len - 1 <= n; i++) {
        const j = i + len - 1;
        w[i][j] = w[i][j - 1] + P[j - 1] + Q[j];
        e[i][j] = Infinity;
        for (let rt = i; rt <= j; rt++) { const t = e[i][rt - 1] + e[rt + 1][j] + w[i][j]; if (t < e[i][j]) { e[i][j] = t; root[i][j] = rt; } }
        show(i, j, `鍵 ${K[i - 1]}..${K[j - 1]}：w = ${w[i][j]}，以 ${K[root[i][j] - 1]} 為根成本最小 = ${e[i][j]}`, 5);
      }
    let id = 0;
    const build = (i: number, j: number, depth: number): BNode | null => { if (i > j) return null; const rt = root[i][j]; return { id: id++, val: K[rt - 1], depth, left: build(i, rt - 1, depth + 1), right: build(rt + 1, j, depth + 1) }; };
    const tr = build(1, n, 1);
    const total = P.reduce((s, x) => s + x, 0) + Q.reduce((s, x) => s + x, 0);
    r.snap(`最小總成本 ${e[1][n]}（加權比較次數），平均每次搜尋 ${(e[1][n] / total).toFixed(3)} 次比較`, [binaryPanel(tr, { sub: (nd) => `p=${P[K.indexOf(nd.val as number)]}`, color: (nd) => (nd.depth === 1 ? 'done' : undefined), title: '最佳二元搜尋樹（頻率高的鍵靠近根）' }), vars({ 總成本: e[1][n], 總頻率: total })], 7);
    return r.frames;
  },
};

// ---------------- 雞蛋掉落 ----------------
const eggDrop: AlgoDef = {
  id: 'egg-dropping', name: '雞蛋掉落問題', en: 'Egg Dropping', cat,
  desc: '有 k 顆雞蛋與 n 層樓，求最壞情況下找出「臨界樓層」所需的最少丟擲次數。換個角度：f(m, k) 表示用 m 次、k 顆蛋最多能區分的樓層數。在某層丟一次：破了剩 k−1 顆蛋處理下面 f(m−1, k−1) 層，沒破處理上面 f(m−1, k) 層，所以 f(m, k) = f(m−1, k−1) + f(m−1, k) + 1。找最小的 m 使 f(m, k) ≥ n。只有一顆蛋時只能逐層試；0 層樓需要 0 次。',
  time: 'O(k · m)（m 為答案）', space: 'O(k)',
  code: ['f[0][*] = 0', 'm = 0', 'while f[m][k] < n:', '  m += 1', '  for e = 1..k: f[m][e] = f[m−1][e−1] + f[m−1][e] + 1', 'return m'],
  inputs: [inNum('k', '雞蛋數 k', 2, 1, 10, () => rnd.int(1, 4)), inNum('n', '樓層數 n', 36, 0, 100000, () => rnd.int(0, 120))],
  run({ k, n }) {
    const r = new Rec();
    const f: number[][] = [new Array(k + 1).fill(0)];
    r.snap('丟 0 次無法區分任何樓層', [table(f, {}, { rowHeaders: ['m = 0'], colHeaders: Array.from({ length: k + 1 }, (_, e) => `${e} 顆蛋`) }), vars({ k, n })], 1);
    if (n === 0) { r.snap('0 層樓不需要丟，答案 0', [vars({ 答案: 0 })], 6); return r.frames; }
    let m = 0;
    while (f[m][k] < n) {
      m++;
      f.push([0, ...Array.from({ length: k }, (_, e) => f[m - 1][e] + f[m - 1][e + 1] + 1)]);
      if (m <= 20 || f[m][k] >= n) r.snap(`丟 ${m} 次、${k} 顆蛋最多能區分 ${f[m][k]} 層` + (f[m][k] >= n ? `，已 ≥ ${n}` : ''), [table(f.slice(-12), { [`${Math.min(f.length, 12) - 1},${k}`]: f[m][k] >= n ? 'done' : 'active' }, { rowHeaders: f.slice(-12).map((_, i) => `m = ${f.length - Math.min(f.length, 12) + i}`), colHeaders: Array.from({ length: k + 1 }, (_, e) => `${e} 顆蛋`) }), vars({ k, n, m })], 5);
    }
    // 第一次應該在哪一層丟
    const first = k > 1 ? f[m - 1][k - 1] + 1 : 1;
    r.snap(`最少需要 ${m} 次。策略：第一次在第 ${Math.min(first, n)} 層丟，破了用剩下的 ${k - 1} 顆蛋處理下面 ${Math.min(first, n) - 1} 層，沒破就往上` + (k === 1 ? '（只有一顆蛋只能從 1 樓逐層往上）' : ''), [vars({ 答案: m, 第一次: Math.min(first, n) }, undefined, { 答案: 'done' })], 6);
    return r.frames;
  },
};

// ---------------- 輪廓線 DP（骨牌鋪滿） ----------------
const profileDp: AlgoDef = {
  id: 'profile-dp', name: '輪廓線動態規劃', en: 'Profile DP (Domino Tiling)', cat,
  desc: '計算用 1×2 骨牌鋪滿 R×C 棋盤的方法數。逐格處理（由上到下、由左到右），狀態是一個 R 位元的遮罩：記錄目前這一欄「已被前一欄橫放骨牌佔走」的格子。對每一格可以：已被佔則跳過；橫放（佔下一欄同一列）；或與下一格直放。處理完一欄後遮罩成為下一欄的輪廓。結果與回溯暴力鋪法比對。',
  time: 'O(C · R · 2^R)', space: 'O(2^R)',
  code: ['dp = {0: 1}（第一欄沒有被佔的格子）', 'for col = 0..C−1:', '  逐列 row 展開：遮罩 cur（本欄被佔）→ nxt（下一欄被佔）', '    若 row 已被佔：跳過', '    橫放：nxt 的 row 位設為 1', '    直放：row 與 row+1 都未被佔時一起填', '  dp = 這一欄結束後的 nxt 分布', '答案 = dp[0]'],
  inputs: [inNum('R', '列數 R（≤ 6）', 3, 1, 6, () => rnd.int(2, 4)), inNum('C', '行數 C（≤ 10）', 4, 1, 10, () => rnd.int(2, 6))],
  run({ R, C }) {
    const r = new Rec();
    let dp = new Map<number, number>([[0, 1]]);
    const bits = (m: number) => Array.from({ length: R }, (_, i) => ((m >> i) & 1 ? '■' : '□')).join('');
    for (let col = 0; col < C; col++) {
      const nd = new Map<number, number>();
      const fill = (row: number, cur: number, nxt: number, ways: number) => {
        if (row === R) { nd.set(nxt, (nd.get(nxt) ?? 0) + ways); return; }
        if (cur >> row & 1) { fill(row + 1, cur, nxt, ways); return; }
        fill(row + 1, cur, nxt | (1 << row), ways);
        if (row + 1 < R && !(cur >> (row + 1) & 1)) fill(row + 2, cur, nxt, ways);
      };
      for (const [m, w] of dp) fill(0, m, 0, w);
      const before = dp;
      dp = nd;
      r.snap(`第 ${col} 欄處理完：${before.size} 種輪廓 → ${nd.size} 種（■ 表示下一欄這一列已被橫放骨牌佔走）`, [table([...before.entries()].map(([m, w]) => [bits(m), w]), {}, { colHeaders: [`第 ${col} 欄開始時`, '方法數'], w: 'half' }), table([...nd.entries()].sort((a, b) => a[0] - b[0]).map(([m, w]) => [bits(m), w]), Object.fromEntries([...nd.keys()].sort((a, b) => a - b).map((m, i) => [`${i},0`, m === 0 ? 'done' as Color : undefined])), { colHeaders: ['結束後（下一欄）', '方法數'], w: 'half' })], 6);
    }
    const ans = dp.get(0) ?? 0;
    // 回溯暴力
    let brute = 0;
    if (R * C <= 30) {
      const g = Array.from({ length: R }, () => new Array(C).fill(false));
      const go = (pos: number) => {
        if (pos === R * C) { brute++; return; }
        const i = Math.floor(pos / C), j = pos % C;
        if (g[i][j]) { go(pos + 1); return; }
        if (j + 1 < C && !g[i][j + 1]) { g[i][j] = g[i][j + 1] = true; go(pos + 1); g[i][j] = g[i][j + 1] = false; }
        if (i + 1 < R) { g[i][j] = g[i + 1][j] = true; go(pos + 1); g[i][j] = g[i + 1][j] = false; }
      };
      go(0);
    }
    r.snap(`${R}×${C} 棋盤共有 ${ans} 種鋪法` + (R * C <= 30 ? `；回溯暴力鋪法得到 ${brute}${brute === ans ? '，一致' : '，不一致！'}` : '') + (R * C % 2 ? '（格數為奇數，不可能鋪滿）' : ''), [vars({ 答案: ans })], 8);
    return r.frames;
  },
};

// ---------------- 子集合和變換（SOS DP） ----------------
const sosDp: AlgoDef = {
  id: 'sos-dp', name: '子集合和變換 DP', en: 'Sum over Subsets DP', cat,
  desc: '對每個遮罩 mask 求 F[mask] = Σ a[sub]（所有 sub ⊆ mask）。直接枚舉子遮罩需要 O(3^n)。SOS DP 一次處理一個位元：若 mask 含第 b 位，就把「去掉第 b 位」的值加進來。處理完 n 個位元後，每個子遮罩恰好被加到一次，總共 O(n·2^n)。',
  time: 'O(n · 2^n)', space: 'O(2^n)',
  code: ['F = a', 'for b = 0..n−1:', '  for mask = 0..2^n−1:', '    if mask 的第 b 位為 1:', '      F[mask] += F[mask ^ (1 << b)]', '與逐一枚舉子遮罩的結果比對'],
  inputs: [inArr([3, 1, 4, 1, 5, 9, 2, 6], 'a[0..2^n−1]（長度需為 2 的冪）', 8, 0, 9)],
  run({ arr: a }) {
    const r = new Rec();
    const N = a.length;
    if (N < 2 || N > 32 || (N & (N - 1))) throw new Error('長度需為 2 的冪（2–32）');
    const n = Math.log2(N);
    const F = [...a];
    const lab = (m: number) => m.toString(2).padStart(n, '0');
    r.snap('初始 F = a', [bars(F, {}, { labels: F.map((v, m) => `${lab(m)}:${v}`), title: 'F[mask]' })], 1);
    for (let b = 0; b < n; b++) {
      const c: Record<number, Color> = {};
      for (let m = 0; m < N; m++) if (m >> b & 1) { F[m] += F[m ^ (1 << b)]; c[m] = 'swap'; c[m ^ (1 << b)] = c[m ^ (1 << b)] ?? 'compare'; }
      r.snap(`處理第 ${b} 位：所有含第 ${b} 位的 mask 加上「去掉該位」的值`, [bars([...F], c, { labels: F.map((v, m) => `${lab(m)}:${v}`), title: `F[mask]（已處理位元 0..${b}）` })], 5);
    }
    const brute = Array.from({ length: N }, (_, m) => { let s = 0; for (let sub = m; ; sub = (sub - 1) & m) { s += a[sub]; if (!sub) break; } return s; });
    const ok = brute.every((x, i) => x === F[i]);
    r.snap(`完成。逐一枚舉子遮罩的結果${ok ? '完全一致' : '不一致！'}，例如 F[${lab(N - 1)}] = 全部總和 ${F[N - 1]}`, [table([F.map((_, m) => lab(m)), F, brute], {}, { rowHeaders: ['mask', 'SOS', '暴力'] })], 6);
    return r.frames;
  },
};

// ---------------- 分治 DP 最佳化 ----------------
const dncDp: AlgoDef = {
  id: 'divide-conquer-dp', name: '分治 DP 最佳化', en: 'Divide and Conquer DP Optimization', cat,
  desc: '把陣列切成 k 段，使「每段總和的平方」之和最小：dp[g][j] = min_{i<j} dp[g−1][i] + (S[j] − S[i])²。這個成本滿足四邊形不等式，因此最佳切點 opt[g][j] 隨 j 單調不減。先算中點 mid 的最佳切點，左半只需在 [optL, opt(mid)] 找、右半在 [opt(mid), optR] 找，每層 O(n log n)。結果與未最佳化的 O(kn²) DP 比對。',
  time: 'O(k · n log n)', space: 'O(kn)',
  code: ['dp[1][j] = S[j]²', 'for g = 2..k: solve(g, 1, n, 0, n−1)', 'solve(g, l, r, optL, optR):', '  mid = (l + r) / 2', '  在 i ∈ [optL, min(mid−1, optR)] 中找最小的 dp[g−1][i] + cost(i, mid)', '  solve(g, l, mid−1, optL, opt)；solve(g, mid+1, r, opt, optR)', '（最佳切點單調是使用這個技巧的前提）'],
  inputs: [inArr([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8], '陣列（非負）', 12, 0, 9), inNum('k', '段數 k', 4, 1, 10)],
  run({ arr: a, k }) {
    const r = new Rec();
    const n = a.length;
    if (k > n) throw new Error('段數不能超過陣列長度');
    if (a.some((x: number) => x < 0)) throw new Error('本例需要非負數，才保證最佳切點單調');
    const S = [0];
    a.forEach((x: number) => S.push(S[S.length - 1] + x));
    const cost = (i: number, j: number) => (S[j] - S[i]) ** 2;
    const INF = Infinity;
    let prev = Array.from({ length: n + 1 }, (_, j) => (j ? cost(0, j) : 0));
    let evals = 0;
    const optAll: number[][] = [];
    for (let g = 2; g <= k; g++) {
      const cur = new Array(n + 1).fill(INF), opt = new Array(n + 1).fill(-1);
      const solve = (l: number, rr: number, oL: number, oR: number, depth: number) => {
        if (l > rr) return;
        const mid = (l + rr) >> 1;
        let best = INF, bi = oL;
        for (let i = oL; i <= Math.min(mid - 1, oR); i++) { evals++; const v = prev[i] + cost(i, mid); if (v < best) { best = v; bi = i; } }
        cur[mid] = best; opt[mid] = bi;
        if (depth < 3) r.snap(`第 ${g} 段、j = ${mid}：只在切點 [${oL}, ${Math.min(mid - 1, oR)}] 中找，最佳切點 ${bi}，dp = ${best}`, [cells(opt.slice(1), Object.fromEntries(opt.slice(1).map((o, j) => [j, j + 1 === mid ? 'done' as Color : j + 1 >= l && j + 1 <= rr ? 'frontier' as Color : undefined])), { title: `opt[${g}][j]（j = 1..n）`, headers: a.map((_: number, j: number) => j + 1) }), vars({ 計算次數: evals })], 5);
        solve(l, mid - 1, oL, bi, depth + 1);
        solve(mid + 1, rr, bi, oR, depth + 1);
      };
      solve(1, n, 0, n - 1, 0);
      optAll.push(opt);
      r.snap(`第 ${g} 段完成：最佳切點序列 ${opt.slice(1).join(', ')} 單調不減`, [cells(opt.slice(1), {}, { title: `opt[${g}][j]`, headers: a.map((_: number, j: number) => j + 1) }), cells(cur.slice(1), {}, { title: `dp[${g}][j]`, headers: a.map((_: number, j: number) => j + 1) }), vars({ 計算次數: evals })], 6);
      prev = cur;
    }
    // 未最佳化對照
    let nv = Array.from({ length: n + 1 }, (_, j) => (j ? cost(0, j) : 0)), naiveEvals = 0;
    for (let g = 2; g <= k; g++) { const cur = new Array(n + 1).fill(INF); for (let j = 1; j <= n; j++) for (let i = 0; i < j; i++) { naiveEvals++; cur[j] = Math.min(cur[j], nv[i] + cost(i, j)); } nv = cur; }
    r.snap(`切成 ${k} 段的最小平方和 = ${prev[n]}；未最佳化 DP 得到 ${nv[n]}${nv[n] === prev[n] ? '（一致）' : '（不一致！）'}。轉移計算次數 ${evals} vs ${naiveEvals}`, [vars({ 答案: prev[n], 最佳化計算: evals, 原始計算: naiveEvals }, undefined, { 答案: 'done' })], 7);
    return r.frames;
  },
};

// ---------------- Knuth 最佳化 ----------------
const knuth: AlgoDef = {
  id: 'knuth-optimization', name: 'Knuth 最佳化', en: 'Knuth Optimization', cat,
  desc: '石子合併：相鄰兩堆合併的代價是兩堆總和，求合併成一堆的最小總代價。區間 DP：dp[i][j] = min_{i≤m<j} dp[i][m] + dp[m+1][j] + sum(i, j)。成本滿足四邊形不等式且單調，所以最佳切點滿足 opt[i][j−1] ≤ opt[i][j] ≤ opt[i+1][j]，只需在這個範圍內枚舉，總時間由 O(n³) 降到 O(n²)。結果與未最佳化版本比對。',
  time: 'O(n²)', space: 'O(n²)',
  code: ['dp[i][i] = 0，opt[i][i] = i', 'for len = 2..n:', '  for i：j = i + len − 1', '    for m = opt[i][j−1] .. min(opt[i+1][j], j−1):', '      t = dp[i][m] + dp[m+1][j] + sum(i, j)', '      取最小者為 dp[i][j]，opt[i][j] = m', '（需先確認成本滿足四邊形不等式與單調性）'],
  inputs: [inArr([4, 1, 7, 3, 9, 2, 6, 5], '每堆石子數', 8, 1, 20)],
  run({ arr: a }) {
    const r = new Rec();
    const n = a.length;
    if (n < 2 || n > 12) throw new Error('堆數需介於 2 與 12');
    const S = [0];
    a.forEach((x: number) => S.push(S[S.length - 1] + x));
    const sum = (i: number, j: number) => S[j + 1] - S[i];
    const dp = Array.from({ length: n }, () => new Array(n).fill(0)), opt = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? i : 0)));
    let evals = 0;
    for (let len = 2; len <= n; len++)
      for (let i = 0; i + len - 1 < n; i++) {
        const j = i + len - 1;
        const lo = opt[i][j - 1], hi = Math.min(opt[i + 1][j], j - 1);
        dp[i][j] = Infinity;
        for (let m = lo; m <= hi; m++) { evals++; const t = dp[i][m] + dp[m + 1][j] + sum(i, j); if (t < dp[i][j]) { dp[i][j] = t; opt[i][j] = m; } }
        if (len <= 3 || i === 0) r.snap(`區間 [${i}, ${j}]：只枚舉切點 ${lo}..${hi}（共 ${hi - lo + 1} 個，原本 ${len - 1} 個），最佳 ${opt[i][j]}，dp = ${dp[i][j]}`, [cells(a, range(i, j, 'active'), { title: '石子堆' }), table(dp.map((row, x) => row.map((v, y) => (y < x ? '' : y === x ? 0 : y - x < len || (y - x === len - 1 && x <= i) ? v : ''))), { [`${i},${j}`]: 'done', [`${i},${j - 1}`]: 'compare', [`${i + 1},${j}`]: 'compare' }, { title: 'dp[i][j]', w: 'half' }), table(opt.map((row, x) => row.map((v, y) => (y < x || y - x >= len ? '' : v))), { [`${i},${j}`]: 'done', [`${i},${j - 1}`]: 'compare', [`${i + 1},${j}`]: 'compare' }, { title: 'opt[i][j]', w: 'half' }), vars({ 計算次數: evals })], 4);
      }
    const nd = Array.from({ length: n }, () => new Array(n).fill(0));
    let naive = 0;
    for (let len = 2; len <= n; len++) for (let i = 0; i + len - 1 < n; i++) { const j = i + len - 1; nd[i][j] = Infinity; for (let m = i; m < j; m++) { naive++; nd[i][j] = Math.min(nd[i][j], nd[i][m] + nd[m + 1][j] + sum(i, j)); } }
    r.snap(`最小合併代價 ${dp[0][n - 1]}；未最佳化 O(n³) 版本得到 ${nd[0][n - 1]}${nd[0][n - 1] === dp[0][n - 1] ? '（一致）' : '（不一致！）'}。轉移計算 ${evals} vs ${naive} 次`, [vars({ 答案: dp[0][n - 1], Knuth: evals, 原始: naive }, undefined, { 答案: 'done' })], 6);
    return r.frames;
  },
};

// ---------------- 凸包技巧 ----------------
const cht: AlgoDef = {
  id: 'convex-hull-trick', name: '凸包技巧', en: 'Convex Hull Trick', cat,
  desc: '跳石頭問題：dp[i] = min_{j<i} dp[j] + (x_i − x_j)² + C。展開後每個 j 對應一條直線 y = (−2x_j)·x + (dp[j] + x_j²)，dp[i] 就是在 x = x_i 處所有直線的最小值再加 x_i² + C。x 遞增時斜率遞減、查詢點也遞增，可用雙端佇列維護下凸包：加線時刪掉被新線與前一條線「夾掉」的線，查詢時從前端刪掉已經不是最小的線，均攤 O(1)。',
  time: 'O(n)（斜率與查詢都單調）', space: 'O(n)',
  code: ['加入直線 j=0：斜率 −2x_0，截距 dp[0] + x_0²', 'for i = 1..n−1:', '  while 佇列前兩條在 x_i 處第二條較小: 彈出前端', '  dp[i] = 前端直線(x_i) + x_i² + C', '  新直線 L_i；while 佇列後兩條與 L_i 讓倒數第一條沒用: 彈出後端', '  L_i 推入後端', '答案 dp[n−1]（與 O(n²) DP 比對）'],
  inputs: [{ key: 'arr', label: '位置 x（遞增）', type: 'array', default: [1, 3, 4, 7, 8, 11, 12, 15], random: () => rnd.distinct(8, 0, 30).sort((p, q) => p - q) }, inNum('C', '每次跳躍的固定成本 C', 10, 0, 1000)],
  run({ arr, C }) {
    const r = new Rec();
    const x = [...arr].sort((p, q) => p - q);
    if (x.some((v, i) => i && v === x[i - 1])) throw new Error('位置必須嚴格遞增');
    const n = x.length;
    const dp = new Array(n).fill(0);
    type L = { m: number; b: number; j: number };
    const dq: L[] = [];
    const f = (l: L, X: number) => l.m * X + l.b;
    const bad = (l1: L, l2: L, l3: L) => (l3.b - l1.b) * (l1.m - l2.m) <= (l2.b - l1.b) * (l1.m - l3.m);
    const lines: L[] = [];
    const plot = (qx: number | null, extra?: string): PlotPanel => {
      const X0 = x[0] - 1, X1 = x[n - 1] + 1;
      const env: [number, number][] = [];
      for (let t = 0; t <= 60; t++) { const X = X0 + ((X1 - X0) * t) / 60; if (dq.length) env.push([X, Math.min(...dq.map((l) => f(l, X)))]); }
      const ys = env.map((p) => p[1]);
      const ylo = Math.min(...ys, 0), yhi = Math.max(...ys, 1);
      return { type: 'plot', title: '灰：所有加入過的直線；藍：佇列中的直線構成的下包絡' + (extra ?? ''), bounds: [X0, X1, ylo - (yhi - ylo) * 0.1, yhi + (yhi - ylo) * 0.3], height: 280, segments: lines.map((l) => ({ x1: X0, y1: f(l, X0), x2: X1, y2: f(l, X1), color: (dq.includes(l) ? 'visited' : 'muted') as Color, width: 1.2 })), curves: env.length ? [{ pts: env, color: 'active', width: 3 }] : [], points: qx !== null && dq.length ? [{ x: qx, y: f(dq[0], qx), color: 'bad', label: `x=${qx}` }] : [], axes: true };
    };
    const first = { m: -2 * x[0], b: dp[0] + x[0] * x[0], j: 0 };
    dq.push(first); lines.push(first);
    r.snap(`dp[0] = 0，加入直線 y = ${first.m}x + ${first.b}`, [plot(null), cells(dp.map((v, i) => (i ? '' : v)), { 0: 'done' }, { title: 'dp' })], 1);
    for (let i = 1; i < n; i++) {
      let popped = 0;
      while (dq.length >= 2 && f(dq[1], x[i]) <= f(dq[0], x[i])) { dq.shift(); popped++; }
      dp[i] = f(dq[0], x[i]) + x[i] * x[i] + C;
      r.snap(`查詢 x = ${x[i]}` + (popped ? `：前端彈出 ${popped} 條已不是最小的直線` : '') + `，最佳轉移來自 j = ${dq[0].j}，dp[${i}] = ${dp[i]}`, [plot(x[i]), cells(dp.map((v, k) => (k <= i ? v : '')), { [i]: 'done', [dq[0].j]: 'compare' }, { title: 'dp' })], 4);
      const L = { m: -2 * x[i], b: dp[i] + x[i] * x[i], j: i };
      let rem = 0;
      while (dq.length >= 2 && bad(dq[dq.length - 2], dq[dq.length - 1], L)) { dq.pop(); rem++; }
      dq.push(L); lines.push(L);
      r.snap(`加入直線 y = ${L.m}x + ${L.b}` + (rem ? `，後端刪除 ${rem} 條被夾掉、永遠不會是最小值的直線` : ''), [plot(null), vars({ 佇列大小: dq.length })], 6);
    }
    const nd = new Array(n).fill(Infinity);
    nd[0] = 0;
    for (let i = 1; i < n; i++) for (let j = 0; j < i; j++) nd[i] = Math.min(nd[i], nd[j] + (x[i] - x[j]) ** 2 + C);
    r.snap(`dp[${n - 1}] = ${dp[n - 1]}；O(n²) DP 得到 ${nd[n - 1]}${nd[n - 1] === dp[n - 1] ? '（一致）' : '（不一致！）'}`, [cells(dp, Object.fromEntries(dp.map((_, i) => [i, 'done' as Color])), { title: 'dp' }), vars({ 答案: dp[n - 1] })], 7);
    return r.frames;
  },
};

// ---------------- 李超線段樹 ----------------
const liChao: AlgoDef = {
  id: 'li-chao-tree', name: '李超線段樹', en: 'Li Chao Tree', cat,
  desc: '支援「任意順序加入直線」與「查詢某個整數 x 的最小值」。線段樹的每個節點負責一段 x 區間並保存一條直線：插入新線時先比較中點，讓在中點較小的線留在節點；另一條線只可能在某一半比較小，因此只遞迴進入一邊。查詢時沿根到葉的路徑取最小值。平行線與斜率任意順序都能處理。',
  time: '插入與查詢各 O(log X)', space: 'O(X)（或動態開點 O(n log X)）',
  code: ['insert(node, [l, r], new):', '  m = (l + r) / 2', '  若 new(m) < node.line(m)：交換兩者（節點保留中點較小者）', '  若 l == r：結束', '  若 new(l) < node.line(l)：insert(左子, new)', '  否則若 new(r) < node.line(r)：insert(右子, new)', 'query(x)：沿根到葉取 min(node.line(x))'],
  inputs: [inText('lines', '直線（每組 斜率 截距，以 ; 分隔）', '1 2; -1 10; 0 6; 2 -6; -2 20; 0.5 3', () => Array.from({ length: 5 }, () => `${rnd.int(-3, 3)} ${rnd.int(-10, 20)}`).join('; ')), inText('qs', '查詢的 x（0–15）', '0 3 5 8 11 15', () => rnd.arr(5, 0, 15).join(' '))],
  run({ lines, qs }) {
    const r = new Rec();
    const L = String(lines).split(';').map((s) => s.trim()).filter(Boolean).map((s) => s.split(/\s+/).map(Number)).map(([m, b], i) => { if (!Number.isFinite(m) || !Number.isFinite(b)) throw new Error(`第 ${i + 1} 條直線格式錯誤`); return { m, b, id: i + 1 }; });
    const Qx = String(qs).split(/[\s,]+/).filter(Boolean).map(Number);
    if (Qx.some((x) => !Number.isInteger(x) || x < 0 || x > 15)) throw new Error('查詢的 x 必須是 0–15 的整數');
    const X = 15;
    type Ln = { m: number; b: number; id: number };
    const f = (l: Ln, x: number) => l.m * x + l.b;
    const tree: Record<number, Ln | null> = {};
    const info: Record<number, [number, number]> = {};
    const build = (o: number, l: number, rr: number) => { info[o] = [l, rr]; tree[o] = null; if (l < rr) { const m = (l + rr) >> 1; build(2 * o, l, m); build(2 * o + 1, m + 1, rr); } };
    build(1, 0, X);
    const treePanel = (hl: Record<number, Color>) => {
      const ids = Object.keys(info).map(Number).filter((o) => tree[o] || hl[o] || o === 1);
      const shown = new Set<number>();
      for (const o of ids) for (let p = o; p >= 1; p >>= 1) shown.add(p);
      const mk = (o: number): BNode | null => (shown.has(o) ? { id: o, val: tree[o] ? `L${tree[o]!.id}` : '·', left: mk(2 * o), right: mk(2 * o + 1) } : null);
      return binaryPanel(mk(1), { badge: (nd) => `[${info[nd.id][0]},${info[nd.id][1]}]`, color: (nd) => hl[nd.id] ?? (tree[nd.id] ? 'visited' : undefined), title: '線段樹（節點內為保存的直線）', w: 'half' });
    };
    const plot = (q?: number): PlotPanel => ({ type: 'plot', title: '所有直線與最小值包絡（藍）', bounds: [0, X, Math.min(...L.map((l) => Math.min(f(l, 0), f(l, X)))) - 1, Math.max(...L.map((l) => Math.max(f(l, 0), f(l, X)))) + 1], height: 260, segments: L.map((l) => ({ x1: 0, y1: f(l, 0), x2: X, y2: f(l, X), color: 'muted' as Color, width: 1.2 })), curves: [{ pts: Array.from({ length: X + 1 }, (_, x) => [x, Math.min(...L.map((l) => f(l, x)))] as [number, number]), color: 'active', width: 2.5 }], points: q !== undefined ? [{ x: q, y: Math.min(...L.map((l) => f(l, q))), color: 'bad', label: `x=${q}` }] : [], axes: true, w: 'half' });
    const insert = (o: number, nl: Ln, path: Record<number, Color>) => {
      const [l, rr] = info[o];
      path[o] = 'compare';
      if (!tree[o]) { tree[o] = nl; path[o] = 'swap'; r.snap(`節點 [${l},${rr}] 是空的，直接放入 L${nl.id}`, [treePanel(path), plot()], 3); return; }
      const m = (l + rr) >> 1;
      let cur = tree[o]!;
      if (f(nl, m) < f(cur, m)) { tree[o] = nl; [nl, cur] = [cur, nl]; path[o] = 'swap'; r.snap(`在中點 x = ${m}，L${tree[o]!.id} 比較小：留在節點，改拿 L${nl.id} 往下`, [treePanel(path), plot()], 3); }
      else r.snap(`在中點 x = ${m}，節點的 L${cur.id} 仍較小，拿 L${nl.id} 往下比`, [treePanel(path), plot()], 3);
      if (l === rr) return;
      if (f(nl, l) < f(tree[o]!, l)) insert(2 * o, nl, path);
      else if (f(nl, rr) < f(tree[o]!, rr)) insert(2 * o + 1, nl, path);
      else r.snap(`L${nl.id} 在整個 [${l},${rr}] 都不比較小，丟棄`, [treePanel(path), plot()], 6);
    };
    for (const nl of L) { r.snap(`插入 L${nl.id}：y = ${nl.m}x + ${nl.b}`, [treePanel({}), plot()], 1); insert(1, nl, {}); }
    const res: (string | number)[][] = [];
    for (const qx of Qx) {
      let o = 1, best = Infinity;
      const path: Record<number, Color> = {};
      while (info[o]) { if (tree[o]) best = Math.min(best, f(tree[o]!, qx)); path[o] = 'done'; const [l, rr] = info[o]; if (l === rr) break; o = qx <= ((l + rr) >> 1) ? 2 * o : 2 * o + 1; }
      const brute = Math.min(...L.map((l) => f(l, qx)));
      res.push([qx, best, brute]);
      r.snap(`查詢 x = ${qx}：沿路徑取最小值 = ${best}（暴力 ${brute}）`, [treePanel(path), plot(qx), table(res, {}, { colHeaders: ['x', '李超樹', '暴力'] })], 7);
    }
    return r.frames;
  },
};

export default [weightedInterval, rodCutting, wordBreak, lcsubstr, lps, palPartition, optimalBst, eggDrop, profileDp, sosDp, dncDp, knuth, cht, liChao] satisfies AlgoDef[];
