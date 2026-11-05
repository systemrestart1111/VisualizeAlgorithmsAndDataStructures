import type { AlgoDef, Color, Frame, GraphPanel } from '../core/types';
import { Rec, cells, vars, table, text, inNum, inText, rnd, seeded, inSeed } from '../core/helpers';
import { adjacency, gpanel, graphInput, layoutTree, parseGraph } from '../core/graph';
import { parseGrid, randomGridText } from './shortest';

const cat = 'backtrack';
const TREE_TITLE = '狀態空間樹';

/** 搜尋樹：先記錄、最後統一配置座標（frames 中的節點座標事後補上） */
class STree {
  label: Record<string, string> = {};
  children: Record<string, string[]> = { t0: [] };
  state: Record<string, Color | undefined> = {};
  sub: Record<string, string> = {};
  shown = new Set<string>(['t0']);
  n = 1;
  constructor(rootLabel = '·') {
    this.label.t0 = rootLabel;
  }
  add(parent: string, label: string) {
    const id = 't' + this.n++;
    this.label[id] = label;
    this.children[id] = [];
    this.children[parent].push(id);
    this.shown.add(id);
    return id;
  }
  panel(): GraphPanel {
    const nodes = [...this.shown].map((id) => ({ id, x: 0, y: 0, label: this.label[id], color: this.state[id], sub: this.sub[id], r: 15 }));
    const edges = [...this.shown].flatMap((id) => this.children[id].filter((c) => this.shown.has(c)).map((c) => ({ from: id, to: c, color: this.state[c] === 'bad' ? ('muted' as Color) : undefined })));
    return { type: 'graph', title: TREE_TITLE, nodes, edges };
  }
  finalize(frames: Frame[]) {
    const pos = layoutTree('t0', this.children, 36, 56);
    for (const f of frames) for (const p of f.panels) if (p.type === 'graph' && p.title === TREE_TITLE) for (const nd of p.nodes) Object.assign(nd, pos[nd.id]);
    return frames;
  }
}

const perms: AlgoDef = {
  id: 'permutations', name: '排列', en: 'Permutations', cat, star: true,
  desc: '回溯法列出所有排列：每一層從「尚未使用」的元素中選一個放到目前位置，遞迴到底就得到一組排列，返回時撤銷選擇。',
  time: 'O(n · n!)', space: 'O(n)',
  code: ['backtrack(path):', '  if |path| == n: output(path); return', '  for x in items:', '    if x 已使用: continue', '    path.push(x); used[x] = true', '    backtrack(path)', '    path.pop(); used[x] = false  (撤銷)'],
  inputs: [inText('items', '元素（空白分隔，建議 ≤ 4 個）', '1 2 3', () => rnd.pick(['A B C', '1 2 3 4', 'x y z']))],
  run({ items }) {
    const r = new Rec();
    const it = String(items).trim().split(/\s+/).slice(0, 5);
    const T = new STree();
    const path: string[] = [], out: string[] = [];
    const used = new Set<number>();
    const P = (msg: string, line: number) => r.snap(msg, [T.panel(), cells(path.length ? path : [''], {}, { title: '目前路徑', headers: false, w: 'half' }), text(out, `結果（${out.length}）`, 'half')], line);
    const bt = (node: string) => {
      T.state[node] = 'active';
      if (path.length === it.length) { out.push(path.join(' ')); T.state[node] = 'done'; P(`得到排列 ${path.join(' ')}`, 2); return; }
      P(`目前路徑 [${path.join(', ')}]`, 3);
      it.forEach((x, i) => {
        if (used.has(i)) return;
        path.push(x); used.add(i);
        const c = T.add(node, x);
        bt(c);
        path.pop(); used.delete(i);
        T.state[node] = 'active';
      });
      if (T.state[node] === 'active') T.state[node] = 'visited';
    };
    bt('t0');
    P(`共 ${out.length} 種排列`, 1);
    return T.finalize(r.frames);
  },
};

const combos: AlgoDef = {
  id: 'combinations', name: '組合', en: 'Combinations C(n, k)', cat, star: true,
  desc: '從 1..n 選 k 個（不計順序）：每一層只考慮比上一個選擇更大的數字，避免重複；剩餘數字不夠湊滿 k 個時剪枝。',
  time: 'O(k · C(n,k))', space: 'O(k)',
  code: ['backtrack(start, path):', '  if |path| == k: output(path); return', '  for i = start .. n:', '    if 剩下的數不夠: break  (剪枝)', '    path.push(i)', '    backtrack(i + 1, path)', '    path.pop()'],
  inputs: [inNum('n', 'n', 5, 1, 7), inNum('k', 'k', 3, 0, 7)],
  run({ n, k }) {
    const r = new Rec();
    k = Math.min(k, n);
    const T = new STree();
    const path: number[] = [], out: string[] = [];
    const P = (msg: string, line: number) => r.snap(msg, [T.panel(), cells(path.length ? path : [''], {}, { title: '目前路徑', headers: false, w: 'half' }), text(out, `結果（${out.length}）`, 'half')], line);
    const bt = (start: number, node: string) => {
      T.state[node] = 'active';
      if (path.length === k) { out.push(path.join(' ')); T.state[node] = 'done'; P(`得到組合 {${path.join(', ')}}`, 2); return; }
      P(`從 ${start} 開始選，目前 [${path.join(', ')}]`, 3);
      for (let i = start; i <= n; i++) {
        if (n - i + 1 < k - path.length) { const c = T.add(node, String(i)); T.state[c] = 'bad'; P(`剩下 ${n - i + 1} 個數，不夠選 ${k - path.length} 個 → 剪枝`, 4); break; }
        path.push(i);
        bt(i + 1, T.add(node, String(i)));
        path.pop();
        T.state[node] = 'active';
      }
      T.state[node] = 'visited';
    };
    bt(1, 't0');
    P(`共 C(${n}, ${k}) = ${out.length} 種組合`, 1);
    return T.finalize(r.frames);
  },
};

const subsets: AlgoDef = {
  id: 'subsets', name: '子集合', en: 'Subsets (Power Set)', cat, star: true,
  desc: '對每個元素做「選／不選」的二元決策，遞迴樹的每片葉子就是一個子集合，共 2ⁿ 個。',
  time: 'O(n · 2ⁿ)', space: 'O(n)',
  code: ['backtrack(i, path):', '  if i == n: output(path); return', '  // 選 a[i]', '  path.push(a[i]); backtrack(i+1); path.pop()', '  // 不選 a[i]', '  backtrack(i+1)'],
  inputs: [inText('items', '元素（建議 ≤ 4 個）', 'a b c', () => rnd.pick(['1 2 3', 'x y z w', 'A B']))],
  run({ items }) {
    const r = new Rec();
    const it = String(items).trim().split(/\s+/).slice(0, 5);
    const T = new STree();
    const path: string[] = [], out: string[] = [];
    const P = (msg: string, line: number) => r.snap(msg, [T.panel(), cells(path.length ? path : ['∅'], {}, { title: '目前子集合', headers: false, w: 'half' }), text(out, `結果（${out.length}）`, 'half')], line);
    const bt = (i: number, node: string) => {
      T.state[node] = 'active';
      if (i === it.length) { out.push('{' + path.join(', ') + '}'); T.state[node] = 'done'; P(`得到子集合 {${path.join(', ')}}`, 2); return; }
      P(`決定是否選 ${it[i]}`, 3);
      path.push(it[i]);
      bt(i + 1, T.add(node, '+' + it[i]));
      path.pop();
      T.state[node] = 'active';
      bt(i + 1, T.add(node, '−' + it[i]));
      T.state[node] = 'visited';
    };
    bt(0, 't0');
    P(`共 2^${it.length} = ${out.length} 個子集合`, 1);
    return T.finalize(r.frames);
  },
};

const nqueens: AlgoDef = {
  id: 'n-queens', name: 'N 皇后', en: 'N-Queens', cat, star: true,
  desc: '在 N×N 棋盤放 N 個皇后使彼此不互相攻擊。逐列放置，每列嘗試每一欄，用三個集合快速檢查同欄與兩條對角線是否衝突；無處可放就回溯。',
  time: 'O(N!)', space: 'O(N)',
  code: ['solve(row):', '  if row == N: 找到解; return', '  for col = 0 .. N-1:', '    if col、row-col、row+col 都未被佔用:', '      放置皇后，標記三個集合', '      solve(row + 1)', '      移除皇后（回溯）', '    else: 衝突，試下一欄'],
  inputs: [inNum('n', 'N', 6, 4, 10), inNum('max', '最多找幾組解', 1, 1, 10)],
  run({ n, max }) {
    const r = new Rec();
    const q: number[] = [];
    const cols = new Set<number>(), d1 = new Set<number>(), d2 = new Set<number>();
    let found = 0, steps = 0;
    const board = (hl: Record<string, Color> = {}) => {
      const rows = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (q[i] === j ? '♛' : '')));
      const c: Record<string, Color> = {};
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        if ((i + j) % 2) c[`${i},${j}`] = 'muted';
        if (q[i] === j) c[`${i},${j}`] = 'done';
      }
      return table(rows, { ...c, ...hl }, { cell: 34, rowHeaders: Array.from({ length: n }, (_, i) => i), colHeaders: Array.from({ length: n }, (_, i) => i) });
    };
    const snap = (msg: string, line: number, hl: Record<string, Color> = {}) => { if (steps++ < 2500) r.snap(msg, [board(hl), vars({ 已找到: found, 列: q.length })], line); };
    const solve = (row: number): boolean => {
      if (row === n) { found++; snap(`找到第 ${found} 組解！`, 2); return found >= max; }
      for (let col = 0; col < n; col++) {
        if (cols.has(col) || d1.has(row - col) || d2.has(row + col)) {
          const att: Record<string, Color> = { [`${row},${col}`]: 'bad' };
          q.forEach((c, i) => { if (c === col || i - c === row - col || i + c === row + col) att[`${i},${c}`] = 'swap'; });
          snap(`(${row}, ${col}) 會被攻擊`, 8, att);
          continue;
        }
        q.push(col); cols.add(col); d1.add(row - col); d2.add(row + col);
        snap(`在 (${row}, ${col}) 放皇后`, 5, { [`${row},${col}`]: 'active' });
        if (solve(row + 1)) return true;
        q.pop(); cols.delete(col); d1.delete(row - col); d2.delete(row + col);
        snap(`第 ${row} 列從 ${col} 回溯`, 7, { [`${row},${col}`]: 'compare' });
      }
      return false;
    };
    solve(0);
    if (!found) r.snap('無解', [board()]);
    else r.snap(`搜尋結束，共找到 ${found} 組解`, [board(), vars({ 已找到: found })]);
    return r.frames;
  },
};

const sudoku: AlgoDef = {
  id: 'sudoku', name: '數獨求解', en: 'Sudoku Solver', cat,
  desc: '回溯 + MRV 啟發：每次選擇「可填數字最少」的空格，依序嘗試每個合法數字，填不下去就回溯。灰底為題目給定的數字。',
  time: '最差指數級', space: 'O(81)',
  code: ['solve():', '  找出候選數最少的空格 (r, c)', '  if 沒有空格: 完成', '  for d in candidates(r, c):', '    board[r][c] = d', '    if solve(): return true', '    board[r][c] = 0（回溯）', '  return false'],
  inputs: [{ key: 'b', label: '題目（9 行，0 或 . 為空格）', type: 'text', multiline: true, default: '530070000\n600195000\n098000060\n800060003\n400803001\n700020006\n060000280\n000419005\n000080079', random: () => rnd.pick(['000000907\n000420180\n000705026\n100904000\n050000040\n000507009\n920108000\n034059000\n507000000', '200080300\n060070084\n030500209\n000105408\n000000000\n402706000\n301007040\n720040060\n004010003', '530070000\n600195000\n098000060\n800060003\n400803001\n700020006\n060000280\n000419005\n000080079']) }],
  run({ b }) {
    const r = new Rec();
    const B = String(b).trim().split('\n').slice(0, 9).map((l) => l.trim().padEnd(9, '0').slice(0, 9).split('').map((c) => (c === '.' ? 0 : Number(c) || 0)));
    const given = B.map((row) => row.map((x) => x !== 0));
    let steps = 0;
    const view = (hl: Record<string, Color> = {}) => {
      const c: Record<string, Color> = {};
      for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) if (given[i][j]) c[`${i},${j}`] = 'muted'; else if (((Math.floor(i / 3) + Math.floor(j / 3)) & 1) === 0 && B[i][j]) c[`${i},${j}`] = 'visited'; else if (B[i][j]) c[`${i},${j}`] = 'active';
      return table(B.map((row) => row.map((x) => x || '')), { ...c, ...hl }, { cell: 30 });
    };
    const ok = (i: number, j: number, d: number) => {
      for (let k = 0; k < 9; k++) if (B[i][k] === d || B[k][j] === d) return false;
      const bi = i - (i % 3), bj = j - (j % 3);
      for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) if (B[bi + x][bj + y] === d) return false;
      return true;
    };
    const snap = (msg: string, line: number, hl = {}) => { if (steps++ < 2500) r.snap(msg, [view(hl), vars({ 步數: steps })], line); };
    snap('題目', 1);
    const solve = (): boolean => {
      let bi = -1, bj = -1, best: number[] = [];
      for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) if (!B[i][j]) {
        const cand = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => ok(i, j, d));
        if (bi < 0 || cand.length < best.length) { bi = i; bj = j; best = cand; }
      }
      if (bi < 0) return true;
      snap(`選擇候選數最少的格子 (${bi}, ${bj})：{${best.join(', ')}}`, 2, { [`${bi},${bj}`]: best.length ? 'compare' : 'bad' });
      for (const d of best) {
        B[bi][bj] = d;
        snap(`(${bi}, ${bj}) 填 ${d}`, 5, { [`${bi},${bj}`]: 'swap' });
        if (solve()) return true;
        B[bi][bj] = 0;
        snap(`(${bi}, ${bj}) 填 ${d} 走不通，回溯`, 7, { [`${bi},${bj}`]: 'bad' });
      }
      return false;
    };
    const done = solve();
    r.snap(done ? `完成！共 ${steps} 步` : '此題無解', [view(), vars({ 步數: steps })], 3);
    return r.frames;
  },
};

const DEF_MAZE = ['S.#.......#.....', '.##.#####.#.###.', '....#...#...#...', '.####.#.#####.#.', '......#.......#.', '#######.#####.#.', '......#.#.....#.', '.####.#.#.#####.', '.#....#...#....E'].join('\n');

const mazeDfs: AlgoDef = {
  id: 'maze-dfs', name: '迷宮搜尋', en: 'Maze Solving (DFS Backtracking)', cat,
  desc: '用深度優先回溯走迷宮：依序嘗試 右、下、左、上，走到死路就退回上一格（標為紅色）。找到的路徑不一定最短（最短請見 BFS／A*）。',
  time: 'O(R · C)', space: 'O(R · C)',
  code: ['dfs(cell):', '  if cell == E: return true', '  標記 cell 已拜訪，加入路徑', '  for dir in [右, 下, 左, 上]:', '    next = cell + dir', '    if next 可走且未拜訪 and dfs(next): return true', '  從路徑移除 cell（死路，回溯）', '  return false'],
  inputs: [{ key: 'grid', label: '地圖（S 起點、E 終點、# 牆）', type: 'text', multiline: true, default: DEF_MAZE, random: () => randomGridText(9, 16, 0.3) }],
  run({ grid }) {
    const r = new Rec();
    const G = parseGrid(grid);
    const path: string[] = [];
    const vis = new Set<string>(), dead = new Set<string>();
    const view = (cur?: string) => {
      const c: Record<string, Color> = {};
      for (let i = 0; i < G.h; i++) for (let j = 0; j < G.w; j++) if (G.wall[i][j]) c[`${i},${j}`] = 'muted';
      for (const k of dead) c[k] = 'bad';
      for (const k of path) c[k] = 'active';
      if (cur) c[cur] = 'compare';
      c[`${G.s[0]},${G.s[1]}`] = 'special';
      c[`${G.e[0]},${G.e[1]}`] = path.includes(`${G.e[0]},${G.e[1]}`) ? 'done' : 'good';
      return table(Array.from({ length: G.h }, (_, i) => Array.from({ length: G.w }, (_, j) => (i === G.s[0] && j === G.s[1] ? 'S' : i === G.e[0] && j === G.e[1] ? 'E' : ''))), c, { cell: 24 });
    };
    const dfs = (i: number, j: number): boolean => {
      const k = `${i},${j}`;
      vis.add(k); path.push(k);
      r.snap(`走到 (${i}, ${j})`, [view(k), vars({ 路徑長: path.length - 1 })], 3);
      if (i === G.e[0] && j === G.e[1]) return true;
      for (const [di, dj] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
        const ni = i + di, nj = j + dj;
        if (ni < 0 || nj < 0 || ni >= G.h || nj >= G.w || G.wall[ni][nj] || vis.has(`${ni},${nj}`)) continue;
        if (dfs(ni, nj)) return true;
      }
      path.pop(); dead.add(k);
      r.snap(`(${i}, ${j}) 是死路，回溯`, [view(), vars({ 路徑長: path.length - 1 })], 7);
      return false;
    };
    const ok = dfs(G.s[0], G.s[1]);
    r.snap(ok ? `找到出口！路徑長度 ${path.length - 1}` : '迷宮無解', [view(), vars({ 路徑長: path.length - 1 })], 2);
    return r.frames;
  },
};

const mazeGen: AlgoDef = {
  id: 'maze-generation', name: '迷宮生成', en: 'Maze Generation (Recursive Backtracker)', cat,
  desc: '隨機化 DFS 產生「完美迷宮」（任兩點間恰有一條路）：從起點出發，隨機選一個未拜訪的鄰格並打通中間的牆，無路可走時回溯，直到所有格子都被拜訪。',
  time: 'O(R · C)', space: 'O(R · C)',
  code: ['stack = [start]; 標記 start 已拜訪', 'while stack 非空:', '  cur = stack.top', '  if cur 有未拜訪的鄰格:', '    隨機選一個 next，打通 cur 與 next 之間的牆', '    標記 next，stack.push(next)', '  else: stack.pop()（回溯）'],
  inputs: [inNum('rows', '列數（格）', 8, 3, 20), inNum('cols', '欄數（格）', 12, 3, 30), inSeed()],
  run({ rows, cols, seed }) {
    const r = new Rec();
    const rand = seeded(seed);
    const H = rows * 2 + 1, W = cols * 2 + 1;
    const g = Array.from({ length: H }, () => new Array(W).fill(true));
    const vis = new Set<string>();
    const st: [number, number][] = [[0, 0]];
    vis.add('0,0');
    g[1][1] = false;
    const view = (cur?: [number, number]) => {
      const c: Record<string, Color> = {};
      for (let i = 0; i < H; i++) for (let j = 0; j < W; j++) if (g[i][j]) c[`${i},${j}`] = 'muted';
      for (const [a, b] of st) c[`${a * 2 + 1},${b * 2 + 1}`] = 'frontier';
      if (cur) c[`${cur[0] * 2 + 1},${cur[1] * 2 + 1}`] = 'active';
      return table(Array.from({ length: H }, () => new Array(W).fill('')), c, { cell: W > 41 ? 10 : 14 });
    };
    r.snap('從左上角開始，全部都是牆', [view([0, 0])], 1);
    while (st.length) {
      const [a, b] = st[st.length - 1];
      const nb = [[0, 1], [1, 0], [0, -1], [-1, 0]].map(([da, db]) => [a + da, b + db]).filter(([x, y]) => x >= 0 && y >= 0 && x < rows && y < cols && !vis.has(`${x},${y}`));
      if (nb.length) {
        const [x, y] = nb[Math.floor(rand() * nb.length)];
        g[a + x + 1][b + y + 1] = false;
        g[x * 2 + 1][y * 2 + 1] = false;
        vis.add(`${x},${y}`);
        st.push([x, y]);
        r.snap(`打通 (${a},${b}) → (${x},${y})`, [view([x, y]), vars({ 已拜訪: vis.size, 堆疊深度: st.length })], 5);
      } else {
        st.pop();
        r.snap(`(${a},${b}) 沒有未拜訪的鄰格，回溯`, [view(st[st.length - 1]), vars({ 已拜訪: vis.size, 堆疊深度: st.length })], 7);
      }
    }
    const txt = g.map((row, i) => row.map((w, j) => (i === 1 && j === 1 ? 'S' : i === H - 2 && j === W - 2 ? 'E' : w ? '#' : '.')).join('')).join('\n');
    r.snap('完成！可以把下方文字貼到「迷宮搜尋」或 A* 試試', [view(), text(txt.split('\n'), '迷宮文字')], 2);
    return r.frames;
  },
};

const coloring: AlgoDef = {
  id: 'graph-coloring', name: '圖著色', en: 'Graph m-Coloring', cat,
  desc: '用至多 m 種顏色為頂點著色，使相鄰頂點顏色不同。依序為每個頂點嘗試每種顏色，若與已著色的鄰居衝突就換下一種，全部不行就回溯。',
  time: 'O(mⁿ)', space: 'O(n)',
  code: ['color(i):', '  if i == n: return true', '  for c = 1 .. m:', '    if 沒有鄰居使用 c:', '      col[v_i] = c', '      if color(i + 1): return true', '      col[v_i] = 0（回溯）', '  return false'],
  inputs: [graphInput('A B\nA C\nA D\nB C\nB E\nC D\nC E\nD F\nE F\nC F'), inNum('m', '顏色數 m', 3, 1, 6)],
  run({ graph, m }) {
    const r = new Rec();
    const g = parseGraph(graph, false);
    const adj = adjacency(g);
    const PAL: Color[] = ['active', 'good', 'special', 'compare', 'visited', 'frontier'];
    const col: Record<string, number> = {};
    let steps = 0;
    const P = (msg: string, line: number, extra: Record<string, Color> = {}) => { if (steps++ < 2000) r.snap(msg, [gpanel(g, { node: { ...Object.fromEntries(Object.entries(col).map(([k, v]) => [k, PAL[v - 1]])), ...extra }, sub: col })], line); };
    const go = (i: number): boolean => {
      if (i === g.nodes.length) return true;
      const v = g.nodes[i];
      for (let c = 1; c <= m; c++) {
        const bad = adj[v].find((a) => col[a.to] === c);
        if (bad) { P(`${v} 不能用顏色 ${c}（鄰居 ${bad.to} 已使用）`, 4, { [v]: 'bad', [bad.to]: 'swap' }); continue; }
        col[v] = c;
        P(`${v} 塗上顏色 ${c}`, 5);
        if (go(i + 1)) return true;
        delete col[v];
        P(`${v} 的顏色 ${c} 導致後面無解，回溯`, 7, { [v]: 'muted' });
      }
      return false;
    };
    const ok = go(0);
    r.snap(ok ? `成功用 ${m} 種顏色完成著色` : `無法用 ${m} 種顏色著色`, [gpanel(g, { node: Object.fromEntries(Object.entries(col).map(([k, v]) => [k, PAL[v - 1]])), sub: col })]);
    return r.frames;
  },
};

const knight: AlgoDef = {
  id: 'knights-tour', name: '騎士巡遊', en: "Knight's Tour (Warnsdorff + Backtracking)", cat,
  desc: '讓西洋棋的騎士走遍棋盤每一格恰好一次。純回溯非常慢，加上 Warnsdorff 啟發：優先走向「後續可走步數最少」的格子，通常幾乎不需回溯。',
  time: '最差指數級', space: 'O(N²)',
  code: ['tour(x, y, k):', '  board[x][y] = k', '  if k == N²: return true', '  moves = 合法的下一步，依「後續可走數」排序', '  for (nx, ny) in moves:', '    if tour(nx, ny, k + 1): return true', '  board[x][y] = 0（回溯）', '  return false'],
  inputs: [inNum('n', '棋盤大小 N', 6, 5, 8), inNum('sx', '起點列', 0, 0, 7), inNum('sy', '起點欄', 0, 0, 7)],
  run({ n, sx, sy }) {
    const r = new Rec();
    sx = Math.min(sx, n - 1); sy = Math.min(sy, n - 1);
    const B = Array.from({ length: n }, () => new Array(n).fill(0));
    const M = [[2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1]];
    const valid = (x: number, y: number) => x >= 0 && y >= 0 && x < n && y < n && !B[x][y];
    const deg = (x: number, y: number) => M.filter(([a, b]) => valid(x + a, y + b)).length;
    let steps = 0, backs = 0;
    const view = (x: number, y: number, cand: [number, number][] = []) => {
      const c: Record<string, Color> = {};
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (B[i][j]) c[`${i},${j}`] = 'visited'; else if ((i + j) % 2) c[`${i},${j}`] = 'muted';
      for (const [a, b] of cand) c[`${a},${b}`] = 'frontier';
      c[`${x},${y}`] = 'active';
      return table(B.map((row) => row.map((v) => v || '')), c, { cell: 34 });
    };
    const tour = (x: number, y: number, k: number): boolean => {
      B[x][y] = k;
      const moves = M.map(([a, b]) => [x + a, y + b] as [number, number]).filter(([a, b]) => valid(a, b)).sort((p, q) => deg(...p) - deg(...q));
      if (steps++ < 1500) r.snap(`第 ${k} 步走到 (${x}, ${y})；青色為下一步候選（已依 Warnsdorff 排序）`, [view(x, y, moves), vars({ 步: k, 回溯次數: backs })], 4);
      if (k === n * n) return true;
      for (const [a, b] of moves) if (tour(a, b, k + 1)) return true;
      B[x][y] = 0; backs++;
      if (steps++ < 1500) r.snap(`(${x}, ${y}) 走不下去，回溯`, [view(x, y), vars({ 步: k, 回溯次數: backs })], 7);
      return false;
    };
    const ok = tour(sx, sy, 1);
    r.snap(ok ? `完成巡遊！回溯 ${backs} 次` : '此起點無解', [table(B.map((row) => row.map((v) => v || '')), Object.fromEntries(B.flatMap((row, i) => row.map((v, j) => [`${i},${j}`, v ? 'done' : 'muted']))) as Record<string, Color>, { cell: 34 }), vars({ 回溯次數: backs })], 3);
    return r.frames;
  },
};

const hamilton: AlgoDef = {
  id: 'hamiltonian-path', name: '漢米爾頓路徑', en: 'Hamiltonian Path (Backtracking)', cat,
  desc: '找一條經過每個頂點恰好一次的路徑（NP 完全問題）。從起點出發，每次延伸到一個未拜訪的鄰居，路徑長度達到 V 即成功；卡住就回溯。',
  time: 'O(V!)', space: 'O(V)',
  code: ['extend(path):', '  if |path| == V: return true', '  u = path.last', '  for v in adj[u]:', '    if v 不在 path:', '      path.push(v)', '      if extend(path): return true', '      path.pop()（回溯）', '  return false'],
  inputs: [graphInput('A B\nA D\nB C\nB E\nC F\nD E\nE F\nD G\nE H\nF I\nG H\nH I'), inText('start', '起點', 'A')],
  run({ graph, start }) {
    const r = new Rec();
    const g = parseGraph(graph, false);
    const adj = adjacency(g);
    const s = g.nodes.includes(start) ? start : g.nodes[0];
    const path = [s], pe: number[] = [];
    let steps = 0;
    const P = (msg: string, line: number, extra: Record<string, Color> = {}, ee: Record<number, Color> = {}) => { if (steps++ < 2000) r.snap(msg, [gpanel(g, { node: { ...Object.fromEntries(path.map((x) => [x, 'active' as Color])), [path[path.length - 1]]: 'compare', ...extra }, edge: { ...Object.fromEntries(pe.map((e) => [e, 'path' as Color])), ...ee }, badge: Object.fromEntries(path.map((x, i) => [x, '#' + i])) }), cells(path, {}, { title: '路徑', headers: false })], line); };
    const ext = (): boolean => {
      if (path.length === g.nodes.length) return true;
      const u = path[path.length - 1];
      for (const { to, ei } of adj[u]) {
        if (path.includes(to)) continue;
        path.push(to); pe.push(ei);
        P(`延伸到 ${to}`, 6);
        if (ext()) return true;
        path.pop(); pe.pop();
        P(`${to} 之後走不下去，回溯`, 8, { [to]: 'bad' }, { [ei]: 'bad' });
      }
      return false;
    };
    P(`從 ${s} 出發`, 1);
    const ok = ext();
    r.snap(ok ? `找到 Hamilton 路徑：${path.join(' → ')}` : `從 ${s} 出發沒有 Hamilton 路徑`, [gpanel(g, { node: Object.fromEntries(path.map((x) => [x, ok ? 'done' : 'muted'] as [string, Color])), edge: Object.fromEntries(pe.map((e) => [e, 'path' as Color])), badge: Object.fromEntries(path.map((x, i) => [x, '#' + i])) })]);
    return r.frames;
  },
};

const DEF_EC = 'A: 1 4 7\nB: 1 4\nC: 4 5 7\nD: 3 5 6\nE: 2 3 6 7\nF: 2 7';

const dlx: AlgoDef = {
  id: 'algorithm-x', name: '精確覆蓋（舞蹈鏈）', en: 'Exact Cover — Knuth Algorithm X (Dancing Links)', cat,
  desc: '從若干子集合中選出一些，使每個元素「恰好」被覆蓋一次。Knuth 的 Algorithm X：選擇包含 1 最少的欄 c，逐一嘗試覆蓋 c 的列 r，刪去與 r 衝突的列與已滿足的欄，遞迴；失敗則還原。Dancing Links 是讓刪除／還原 O(1) 的鏈結串列實作技巧。',
  time: '最差指數級', space: 'O(1 的個數)',
  code: ['search():', '  if 沒有剩餘欄: 找到解', '  c = 剩餘列中 1 最少的欄', '  for 每個在 c 欄為 1 的列 r:', '    選擇 r', '    for r 覆蓋的每一欄 j:', '      刪除欄 j 以及所有在 j 欄為 1 的列', '    search()', '    還原（dancing links 的 uncover）'],
  inputs: [{ key: 'sets', label: '子集合（名稱: 元素…）', type: 'text', multiline: true, default: DEF_EC, random: () => rnd.pick([DEF_EC, 'A: 1 2\nB: 3 4\nC: 1 3\nD: 2 4\nE: 1 2 3\nF: 4', 'A: 1 2 3\nB: 4 5\nC: 1 4\nD: 2 5\nE: 3\nF: 2 3 5', 'P: 1 3\nQ: 2 4\nR: 1 2\nS: 3 4\nT: 2 3'] ) }],
  run({ sets }) {
    const r = new Rec();
    const rows = String(sets).trim().split('\n').map((l) => l.split(':')).filter((x) => x.length === 2).map(([k, v]) => ({ name: k.trim(), els: v.trim().split(/\s+/) }));
    const cols = [...new Set(rows.flatMap((x) => x.els))].sort((a, b) => (isNaN(+a) || isNaN(+b) ? a.localeCompare(b) : +a - +b));
    const M = rows.map((x) => cols.map((c) => (x.els.includes(c) ? 1 : 0)));
    const aliveR = new Set(rows.map((_, i) => i)), aliveC = new Set(cols.map((_, j) => j));
    const sol: number[] = [];
    let steps = 0;
    const view = (hl: Record<string, Color> = {}, msg = '', line = 1) => {
      if (steps++ > 800) return;
      const c: Record<string, Color> = {};
      rows.forEach((_, i) => cols.forEach((_, j) => {
        if (!aliveR.has(i) || !aliveC.has(j)) c[`${i},${j}`] = 'muted';
        else if (M[i][j]) c[`${i},${j}`] = 'frontier';
      }));
      for (const i of sol) cols.forEach((_, j) => { if (M[i][j]) c[`${i},${j}`] = 'done'; });
      r.snap(msg, [table(M.map((row) => row.map((x) => (x ? 1 : ''))), { ...c, ...hl }, { rowHeaders: rows.map((x) => x.name), colHeaders: cols, title: '關聯矩陣（灰：已刪除，綠：已選的列）' }), vars({ 已選: sol.map((i) => rows[i].name).join(' ') || '∅' })], line);
    };
    view({}, '建立 0/1 關聯矩陣', 1);
    const found: string[] = [];
    const search = (): boolean => {
      if (!aliveC.size) { found.push(sol.map((i) => rows[i].name).join(' ')); view({}, `所有欄都被恰好覆蓋一次 → 找到解 {${found[found.length - 1]}}`, 2); return true; }
      let best = -1, cnt = Infinity;
      for (const j of aliveC) { const k = [...aliveR].filter((i) => M[i][j]).length; if (k < cnt) { cnt = k; best = j; } }
      view(Object.fromEntries(rows.map((_, i) => [`${i},${best}`, 'compare' as Color])), `選擇 1 最少的欄 ${cols[best]}（${cnt} 個）`, 3);
      if (!cnt) { view({}, `欄 ${cols[best]} 沒有任何列可以覆蓋 → 失敗，回溯`, 3); return false; }
      for (const i of [...aliveR].filter((x) => M[x][best])) {
        sol.push(i);
        const removedC = cols.map((_, j) => j).filter((j) => M[i][j] && aliveC.has(j));
        const removedR = [...aliveR].filter((x) => removedC.some((j) => M[x][j]));
        view(Object.fromEntries(removedR.flatMap((x) => cols.map((_, j) => [`${x},${j}`, x === i ? 'active' : 'bad'] as [string, Color]))), `嘗試列 ${rows[i].name}：紅色列與它衝突，將被刪除`, 6);
        removedC.forEach((j) => aliveC.delete(j));
        removedR.forEach((x) => aliveR.delete(x));
        view({}, `覆蓋欄 ${removedC.map((j) => cols[j]).join(', ')}`, 7);
        if (search()) return true;
        removedC.forEach((j) => aliveC.add(j));
        removedR.forEach((x) => aliveR.add(x));
        sol.pop();
        view({}, `還原列 ${rows[i].name} 造成的刪除（uncover）`, 9);
      }
      return false;
    };
    if (!search()) r.snap('沒有精確覆蓋', []);
    return r.frames;
  },
};

const bnb: AlgoDef = {
  id: 'branch-and-bound', name: '分支限界法', en: 'Branch and Bound (0/1 Knapsack)', cat,
  desc: '以「最佳優先」展開狀態空間樹，每個節點用分數背包計算價值上界；若上界 ≤ 目前最佳解就剪枝（紅色），比單純回溯少展開大量節點。',
  time: '最差 O(2ⁿ)', space: 'O(2ⁿ)',
  code: ['物品依 價值/重量 排序', 'pq = {root}, best = 0', 'while pq 非空:', '  node = 上界最大者', '  if node.bound <= best: 剪枝', '  分支：選第 i 件 / 不選第 i 件', '  若可行且價值 > best: 更新 best', '  bound(child) > best 才放入 pq'],
  inputs: [{ key: 'items', label: '物品（重量 價值，以 ; 分隔）', type: 'text', default: '2 40; 3.14 50; 1.98 100; 5 95; 3 30', random: () => Array.from({ length: rnd.int(4, 5) }, () => `${rnd.int(1, 6)} ${rnd.int(10, 100)}`).join('; ') }, inNum('W', '容量', 10, 1, 30)],
  run({ items, W }) {
    const r = new Rec();
    const it = String(items).split(';').map((x) => x.trim().split(/\s+/).map(Number)).filter((x) => x.length === 2).map(([w, v], i) => ({ name: 'I' + i, w, v })).sort((a, b) => b.v / b.w - a.v / a.w);
    const n = it.length;
    const bound = (i: number, w: number, v: number) => {
      if (w > W) return 0;
      let b = v, cw = w;
      for (let k = i; k < n; k++) { if (cw + it[k].w <= W) { cw += it[k].w; b += it[k].v; } else { b += ((W - cw) * it[k].v) / it[k].w; break; } }
      return +b.toFixed(2);
    };
    const T = new STree('root');
    type Nd = { id: string; i: number; w: number; v: number; b: number; take: string[] };
    let best = 0, bestSet: string[] = [];
    const root: Nd = { id: 't0', i: 0, w: 0, v: 0, b: bound(0, 0, 0), take: [] };
    T.sub.t0 = `v0 b${root.b}`;
    const pq: Nd[] = [root];
    const P = (msg: string, line: number) => r.snap(msg, [T.panel(), table(it.map((x) => [x.name, x.w, x.v, +(x.v / x.w).toFixed(2)]), {}, { colHeaders: ['物品', '重量', '價值', '比值'], w: 'half' }), vars({ best, 解: bestSet.join(' ') || '∅', 佇列: pq.length })], line);
    P('物品依價值/重量排序；節點下方 v = 目前價值、b = 上界', 1);
    let guard = 0;
    while (pq.length && guard++ < 200) {
      pq.sort((a, b) => b.b - a.b);
      const nd = pq.shift()!;
      if (nd.b <= best) { T.state[nd.id] = 'bad'; P(`節點上界 ${nd.b} ≤ best ${best}，剪枝`, 5); continue; }
      T.state[nd.id] = 'active';
      P(`展開上界最大的節點（b = ${nd.b}）`, 4);
      T.state[nd.id] = 'visited';
      if (nd.i >= n) continue;
      const x = it[nd.i];
      for (const take of [true, false]) {
        const w = nd.w + (take ? x.w : 0), v = nd.v + (take ? x.v : 0);
        const id = T.add(nd.id, (take ? '+' : '−') + x.name);
        const b = bound(nd.i + 1, w, v);
        T.sub[id] = w > W ? '超重' : `v${+v.toFixed(2)} b${b}`;
        if (w > W) { T.state[id] = 'bad'; P(`選 ${x.name} 會超重，剪枝`, 6); continue; }
        if (v > best) { best = +v.toFixed(2); bestSet = take ? [...nd.take, x.name] : nd.take; T.state[id] = 'done'; P(`${take ? '選' : '不選'} ${x.name}：價值 ${v} 更新 best`, 7); }
        if (b > best) { pq.push({ id, i: nd.i + 1, w, v, b, take: take ? [...nd.take, x.name] : nd.take }); if (T.state[id] !== 'done') T.state[id] = 'frontier'; P(`${take ? '選' : '不選'} ${x.name}：上界 ${b} > best，放入佇列`, 8); }
        else { T.state[id] = 'bad'; P(`${take ? '選' : '不選'} ${x.name}：上界 ${b} ≤ best ${best}，剪枝`, 8); }
      }
    }
    P(`最佳價值 ${best}，選擇 ${bestSet.join(', ')}`, 3);
    return T.finalize(r.frames);
  },
};

export default [perms, combos, subsets, nqueens, sudoku, mazeDfs, mazeGen, coloring, knight, hamilton, dlx, bnb];
