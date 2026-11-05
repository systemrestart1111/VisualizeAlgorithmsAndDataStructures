import type { AlgoDef, Color, GraphPanel } from '../core/types';
import { Rec, cells, vars, inText, inSelect, rnd, table, text } from '../core/helpers';
import { binaryPanel, layoutTree, parseGraph, rootTree, randomTreeText, type BNode } from '../core/graph';

const cat = 'tree';

/** 由層序字串建立二元樹，null 或 # 表示空 */
export function buildLevel(s: string): BNode | null {
  const tk = s.split(/[\s,]+/).filter(Boolean);
  if (!tk.length || tk[0] === 'null' || tk[0] === '#') return null;
  let id = 0;
  const mk = (v: string): BNode => ({ id: id++, val: isNaN(Number(v)) ? v : Number(v), left: null, right: null });
  const root = mk(tk[0]);
  const q = [root];
  let i = 1;
  while (q.length && i < tk.length) {
    const n = q.shift()!;
    for (const side of ['left', 'right'] as const) {
      if (i >= tk.length) break;
      const v = tk[i++];
      if (v !== 'null' && v !== '#') { n[side] = mk(v); q.push(n[side]!); }
    }
  }
  return root;
}

const randomLevel = () => {
  const n = rnd.int(7, 13);
  const vals = rnd.distinct(n, 1, 99);
  const out: string[] = [String(vals[0])];
  let k = 1;
  while (k < n) { if (Math.random() < 0.18) out.push('null'); else out.push(String(vals[k++])); }
  return out.join(' ');
};
const treeInput = (def = '1 2 3 4 5 6 7 null 8 9 null null 10') => inText('tree', '二元樹（層序，null 表示空）', def, randomLevel);

const traversal: AlgoDef = {
  id: 'tree-traversal', name: '前序／中序／後序走訪', en: 'Pre / In / Post-order Traversal', cat, star: true,
  desc: '深度優先走訪二元樹的三種順序：前序（根→左→右）、中序（左→根→右）、後序（左→右→根）。差別只在「拜訪根」發生在遞迴的哪個時間點。',
  time: 'O(n)', space: 'O(h)',
  code: ['visit(node):', '  if node == null: return', '  [前序] output(node)', '  visit(node.left)', '  [中序] output(node)', '  visit(node.right)', '  [後序] output(node)'],
  inputs: [treeInput(), inSelect('order', '順序', [['pre', '前序 Pre-order'], ['in', '中序 In-order'], ['post', '後序 Post-order']])],
  run({ tree, order }) {
    const r = new Rec();
    const root = buildLevel(tree);
    const out: (string | number)[] = [];
    const done = new Set<BNode>(), stack = new Set<BNode>();
    let cur: BNode | null = null;
    const P = () => [binaryPanel(root, { color: (n) => (n === cur ? 'active' : done.has(n) ? 'done' : stack.has(n) ? 'frontier' : undefined) }), cells(out.length ? out : [''], {}, { title: '輸出序列', headers: false })];
    const visit = (n: BNode | null) => {
      if (!n) return;
      stack.add(n); cur = n;
      r.snap(`進入節點 ${n.val}`, P(), 1);
      if (order === 'pre') { out.push(n.val); done.add(n); r.snap(`前序：輸出 ${n.val}`, P(), 3); }
      visit(n.left);
      cur = n;
      if (order === 'in') { out.push(n.val); done.add(n); r.snap(`中序：左子樹完成，輸出 ${n.val}`, P(), 5); }
      visit(n.right);
      cur = n;
      if (order === 'post') { out.push(n.val); done.add(n); r.snap(`後序：左右子樹都完成，輸出 ${n.val}`, P(), 7); }
      stack.delete(n);
    };
    visit(root);
    cur = null;
    r.snap(`走訪結果：${out.join(' → ')}`, P());
    return r.frames;
  },
};

const levelOrder: AlgoDef = {
  id: 'level-order', name: '層序走訪', en: 'Level-order Traversal (BFS)', cat, star: true,
  desc: '用佇列逐層由左到右走訪：取出隊首節點輸出，再把它的左右子節點加入佇列。',
  time: 'O(n)', space: 'O(w)，w 為最大寬度',
  code: ['q = [root]', 'while q 非空:', '  node = q.dequeue()', '  output(node)', '  if node.left: q.enqueue(node.left)', '  if node.right: q.enqueue(node.right)'],
  inputs: [treeInput()],
  run({ tree }) {
    const r = new Rec();
    const root = buildLevel(tree);
    if (!root) { r.snap('空樹', []); return r.frames; }
    const q: BNode[] = [root];
    const out: (string | number)[] = [];
    const done = new Set<BNode>();
    let cur: BNode | null = null;
    const P = () => [binaryPanel(root, { color: (n) => (n === cur ? 'active' : done.has(n) ? 'done' : q.includes(n) ? 'frontier' : undefined) }), cells(q.length ? q.map((n) => n.val) : [''], {}, { title: '佇列（左為隊首）', headers: false, w: 'half' }), cells(out.length ? out : [''], {}, { title: '輸出', headers: false, w: 'half' })];
    r.snap('把根放入佇列', P(), 1);
    while (q.length) {
      cur = q.shift()!;
      out.push(cur.val);
      done.add(cur);
      r.snap(`取出 ${cur.val} 並輸出`, P(), 4);
      if (cur.left) { q.push(cur.left); r.snap(`左子 ${cur.left.val} 入佇列`, P(), 5); }
      if (cur.right) { q.push(cur.right); r.snap(`右子 ${cur.right.val} 入佇列`, P(), 6); }
    }
    cur = null;
    r.snap(`層序結果：${out.join(' → ')}`, P());
    return r.frames;
  },
};

const morris: AlgoDef = {
  id: 'morris-traversal', name: '莫里斯中序走訪', en: 'Morris In-order Traversal', cat,
  desc: '不用堆疊也不用遞迴的 O(1) 空間中序走訪：利用左子樹最右節點的空 right 指標，暫時建立指回目前節點的「線索」，走完左子樹後再拆除。',
  time: 'O(n)', space: 'O(1)',
  code: ['cur = root', 'while cur != null:', '  if cur.left == null:', '    output(cur); cur = cur.right', '  else:', '    pre = cur.left 的最右節點（且 pre.right != cur）', '    if pre.right == null: pre.right = cur（建立線索）; cur = cur.left', '    else: pre.right = null（拆除）; output(cur); cur = cur.right'],
  inputs: [treeInput('6 3 9 1 4 8 11 null 2 null 5 7')],
  run({ tree }) {
    const r = new Rec();
    const root = buildLevel(tree);
    const threads = new Map<BNode, BNode>();
    const out: (string | number)[] = [];
    const done = new Set<BNode>();
    let cur: BNode | null = root, pre: BNode | null = null;
    const P = (): any[] => {
      const g = binaryPanel(root, { color: (n) => (n === cur ? 'active' : n === pre ? 'compare' : done.has(n) ? 'done' : undefined) });
      for (const [a, b] of threads) g.edges.push({ from: 'n' + a.id, to: 'n' + b.id, directed: true, dashed: true, color: 'special', curve: 20 });
      return [g, cells(out.length ? out : [''], {}, { title: '輸出（粉紅虛線為暫時線索）', headers: false })];
    };
    r.snap('cur = root', P(), 1);
    while (cur) {
      if (!cur.left) {
        out.push(cur.val); done.add(cur);
        r.snap(`${cur.val} 沒有左子樹：輸出，往右走`, P(), 4);
        cur = threads.get(cur) ?? cur.right;
        continue;
      }
      pre = cur.left;
      while (pre.right) pre = pre.right;
      r.snap(`找到左子樹的最右節點 pre = ${pre.val}`, P(), 6);
      if (threads.get(pre) !== cur) {
        threads.set(pre, cur);
        r.snap(`建立線索 ${pre.val} → ${cur.val}，往左走`, P(), 7);
        cur = cur.left;
      } else {
        threads.delete(pre);
        out.push(cur.val); done.add(cur);
        r.snap(`線索已存在代表左子樹走完：拆除線索，輸出 ${cur.val}，往右走`, P(), 8);
        cur = threads.get(cur) ?? cur.right;
      }
      pre = null;
    }
    r.snap(`中序結果：${out.join(' → ')}（樹已還原）`, P());
    return r.frames;
  },
};

// ---------- 一般樹工具 ----------
const treeEdgesInput = (def: string) => ({ key: 'graph', label: '樹（每行：父 子）', type: 'text' as const, multiline: true, default: def, random: () => randomTreeText(rnd.int(8, 13)) });
const DEF_TREE = '1 2\n1 3\n2 4\n2 5\n3 6\n3 7\n5 8\n5 9\n6 10\n9 11\n7 12';

function genTree(src: string, rootHint?: string) {
  const g = parseGraph(src, false);
  const root = rootHint && g.nodes.includes(rootHint) ? rootHint : g.nodes[0];
  const t = rootTree(g, root);
  const pos = layoutTree(root, t.children);
  return { g, root, ...t, pos };
}

function treePanel(T: ReturnType<typeof genTree>, o: { node?: Record<string, Color | undefined>; sub?: Record<string, string | number | undefined>; edge?: (p: string, c: string) => Color | undefined; title?: string; w?: 'full' | 'half'; badge?: Record<string, string> } = {}): GraphPanel {
  const nodes = T.order.map((id) => ({ id, x: T.pos[id].x, y: T.pos[id].y, label: id, color: o.node?.[id], sub: o.sub?.[id] !== undefined ? String(o.sub[id]) : undefined, badge: o.badge?.[id] }));
  const edges = T.order.filter((id) => T.parent[id] !== null).map((id) => ({ from: T.parent[id]!, to: id, color: o.edge?.(T.parent[id]!, id), width: o.edge?.(T.parent[id]!, id) ? 4 : undefined }));
  return { type: 'graph', nodes, edges, title: o.title, w: o.w };
}

const diameter: AlgoDef = {
  id: 'tree-diameter', name: '樹的直徑', en: 'Tree Diameter (Two BFS)', cat,
  desc: '樹上最遠兩點的距離。兩次 BFS：從任意點出發找到最遠點 u，再從 u 出發找到最遠點 v，u–v 的路徑即為直徑。',
  time: 'O(n)', space: 'O(n)',
  code: ['u = 從任意點 BFS 後距離最遠的點', 'v = 從 u BFS 後距離最遠的點', 'diameter = dist(u, v)', '沿 parent 指標還原 u–v 路徑'],
  inputs: [treeEdgesInput(DEF_TREE)],
  run({ graph }) {
    const r = new Rec();
    const T = genTree(graph);
    const adj: Record<string, string[]> = {};
    for (const n of T.g.nodes) adj[n] = [];
    for (const e of T.g.edges) { adj[e.u].push(e.v); adj[e.v].push(e.u); }
    const bfs = (s: string, line: number, label: string) => {
      const d: Record<string, number> = { [s]: 0 }, par: Record<string, string | null> = { [s]: null };
      const q = [s];
      const seen = new Set([s]);
      for (let i = 0; i < q.length; i++) {
        const u = q[i];
        for (const v of adj[u]) if (!(v in d)) { d[v] = d[u] + 1; par[v] = u; q.push(v); }
        seen.add(u);
        r.snap(`${label}：BFS 拜訪 ${u}（距離 ${d[u]}）`, [treePanel(T, { node: { ...Object.fromEntries([...seen].map((x) => [x, 'visited' as Color])), [s]: 'special', [u]: 'active' }, sub: d })], line);
      }
      const far = q.reduce((a, b) => (d[b] > d[a] ? b : a));
      return { d, par, far };
    };
    const A = bfs(T.root, 1, `第一次（從 ${T.root}）`);
    r.snap(`最遠點 u = ${A.far}（距離 ${A.d[A.far]}）`, [treePanel(T, { node: { [A.far]: 'path' }, sub: A.d })], 1);
    const B = bfs(A.far, 2, `第二次（從 ${A.far}）`);
    const path = new Set<string>();
    for (let x: string | null = B.far; x !== null; x = B.par[x]) path.add(x);
    r.snap(`直徑 = dist(${A.far}, ${B.far}) = ${B.d[B.far]}`, [treePanel(T, { node: Object.fromEntries([...path].map((x) => [x, 'path' as Color])), sub: B.d, edge: (p, c) => (path.has(p) && path.has(c) ? 'path' : undefined) }), vars({ u: A.far, v: B.far, diameter: B.d[B.far] })], 4);
    return r.frames;
  },
};

const lca: AlgoDef = {
  id: 'lca', name: '最近共同祖先', en: 'Lowest Common Ancestor (Binary Lifting)', cat,
  desc: '倍增法：預處理 up[k][v] = v 的第 2^k 個祖先。查詢時先把較深的點往上跳到同深度，再從大到小嘗試同時往上跳，只要跳完不相同就跳。',
  time: '預處理 O(n log n)，查詢 O(log n)', space: 'O(n log n)',
  code: ['DFS 求 depth 與 up[0][v] = parent', 'up[k][v] = up[k-1][ up[k-1][v] ]', 'query(a, b):', '  若 depth[a] < depth[b] 交換', '  把 a 往上跳 depth[a] - depth[b]', '  if a == b: return a', '  for k = LOG-1 .. 0:', '    if up[k][a] != up[k][b]: a, b 同時上跳', '  return up[0][a]'],
  inputs: [treeEdgesInput(DEF_TREE), inText('a', '節點 a', '8'), inText('b', '節點 b', '11')],
  run({ graph, a, b }) {
    const r = new Rec();
    const T = genTree(graph);
    if (!T.g.nodes.includes(a)) a = T.order[T.order.length - 1];
    if (!T.g.nodes.includes(b)) b = T.order[Math.floor(T.order.length / 2)];
    const depth: Record<string, number> = { [T.root]: 0 };
    for (const v of T.order) if (T.parent[v] !== null) depth[v] = depth[T.parent[v]!] + 1;
    const LOG = Math.max(1, Math.ceil(Math.log2(T.order.length + 1)));
    const up: Record<string, string>[] = [Object.fromEntries(T.order.map((v) => [v, T.parent[v] ?? T.root]))];
    for (let k = 1; k < LOG; k++) up.push(Object.fromEntries(T.order.map((v) => [v, up[k - 1][up[k - 1][v]]])));
    const upTable = (hl: Record<string, Color> = {}) => table(up.map((row) => T.order.map((v) => row[v])), hl, { colHeaders: T.order, rowHeaders: up.map((_, k) => `2^${k}`), title: 'up[k][v]：v 的第 2^k 個祖先' });
    r.snap('預處理深度與倍增表', [treePanel(T, { sub: depth }), upTable()], 2);
    const col = (x: string, y: string, extra: Record<string, Color> = {}) => treePanel(T, { node: { [x]: 'active', [y]: 'frontier', ...extra }, sub: depth });
    r.snap(`查詢 LCA(${a}, ${b})`, [col(a, b), upTable()], 3);
    if (depth[a] < depth[b]) [a, b] = [b, a];
    let diff = depth[a] - depth[b];
    for (let k = 0; diff; k++, diff >>= 1)
      if (diff & 1) {
        const na = up[k][a];
        r.snap(`a 往上跳 2^${k} 步：${a} → ${na}`, [col(na, b), upTable({ [`${k},${T.order.indexOf(a)}`]: 'swap' })], 5);
        a = na;
      }
    if (a === b) { r.snap(`同深度後 a = b = ${a}，LCA = ${a}`, [treePanel(T, { node: { [a]: 'done' }, sub: depth })], 6); return r.frames; }
    for (let k = LOG - 1; k >= 0; k--) {
      const ia = T.order.indexOf(a), ib = T.order.indexOf(b);
      if (up[k][a] !== up[k][b]) {
        r.snap(`up[${k}][${a}] = ${up[k][a]} ≠ up[${k}][${b}] = ${up[k][b]}，同時上跳`, [col(up[k][a], up[k][b]), upTable({ [`${k},${ia}`]: 'swap', [`${k},${ib}`]: 'swap' })], 8);
        a = up[k][a]; b = up[k][b];
      } else r.snap(`up[${k}] 相同（${up[k][a]}），跳太多了，不跳`, [col(a, b), upTable({ [`${k},${ia}`]: 'compare', [`${k},${ib}`]: 'compare' })], 7);
    }
    const ans = up[0][a];
    r.snap(`LCA = parent(${a}) = ${ans}`, [treePanel(T, { node: { [ans]: 'done', [a]: 'active', [b]: 'frontier' }, sub: depth }), upTable()], 9);
    return r.frames;
  },
};

const euler: AlgoDef = {
  id: 'euler-tour', name: '歐拉序走訪', en: 'Euler Tour of a Tree', cat,
  desc: 'DFS 時進入節點與每次從子節點返回都記錄一次，得到長度 2n−1 的序列。tin/tout 讓「子樹」變成連續區間；配合 RMQ 可在 O(1) 求 LCA。',
  time: 'O(n)', space: 'O(n)',
  code: ['dfs(u):', '  tin[u] = 時間戳; tour.append(u)', '  for v in children(u):', '    dfs(v)', '    tour.append(u)  (返回時再記一次)', '  tout[u] = 時間戳'],
  inputs: [treeEdgesInput('1 2\n1 3\n2 4\n2 5\n3 6\n5 7\n6 8')],
  run({ graph }) {
    const r = new Rec();
    const T = genTree(graph);
    const tour: string[] = [], depthSeq: number[] = [];
    const tin: Record<string, number> = {}, tout: Record<string, number> = {};
    const stack = new Set<string>();
    let timer = 0;
    const P = (u: string) => [treePanel(T, { node: { ...Object.fromEntries([...stack].map((x) => [x, 'frontier' as Color])), ...Object.fromEntries(Object.keys(tout).map((x) => [x, 'done' as Color])), [u]: 'active' }, sub: Object.fromEntries(T.order.map((x) => [x, tin[x] !== undefined ? `[${tin[x]},${tout[x] ?? '?'}]` : undefined])) }), table([tour, depthSeq], { [`0,${tour.length - 1}`]: 'swap' }, { rowHeaders: ['tour', 'depth'], colHeaders: tour.map((_, i) => i), title: 'Euler 序列' })];
    const dfs = (u: string, d: number) => {
      stack.add(u);
      tin[u] = timer++;
      tour.push(u); depthSeq.push(d);
      r.snap(`進入 ${u}，tin = ${tin[u]}`, P(u), 2);
      for (const v of T.children[u]) {
        dfs(v, d + 1);
        tour.push(u); depthSeq.push(d);
        r.snap(`從 ${v} 返回 ${u}，再記錄一次`, P(u), 5);
      }
      tout[u] = timer - 1;
      stack.delete(u);
      r.snap(`離開 ${u}，tout = ${tout[u]}（子樹佔 tin 區間 [${tin[u]}, ${tout[u]}]）`, P(u), 6);
    };
    dfs(T.root, 0);
    r.snap(`Euler 序列長度 = ${tour.length} = 2n − 1`, P(''));
    return r.frames;
  },
};

const CHAIN: Color[] = ['active', 'path', 'visited', 'good', 'special', 'frontier', 'compare', 'swap'];

const hld: AlgoDef = {
  id: 'hld', name: '樹鏈剖分', en: 'Heavy-Light Decomposition', cat,
  desc: '每個節點選子樹最大的子節點為「重兒子」，重邊串成重鏈。任一點到根的路徑最多經過 O(log n) 條鏈；配合 DFS 序讓每條鏈在陣列上連續，可用線段樹處理路徑查詢。',
  time: 'O(n) 預處理，路徑查詢 O(log² n)', space: 'O(n)',
  code: ['dfs1(u): 計算 size[u]，heavy[u] = size 最大的子節點', 'dfs2(u, h): head[u] = h, pos[u] = 計數器++', '  if heavy[u]: dfs2(heavy[u], h)  (延續重鏈)', '  for 其他子節點 v: dfs2(v, v)  (開新鏈)', 'path(a, b): 每次跳 head 較深的一端到 parent(head)'],
  inputs: [treeEdgesInput('1 2\n1 3\n1 4\n2 5\n2 6\n3 7\n5 8\n5 9\n5 10\n7 11\n9 12\n4 13\n13 14'), inText('a', '路徑端點 a', '12'), inText('b', '路徑端點 b', '14')],
  run({ graph, a, b }) {
    const r = new Rec();
    const T = genTree(graph);
    const size: Record<string, number> = {}, heavy: Record<string, string | null> = {};
    for (const u of [...T.order].reverse()) {
      size[u] = 1 + T.children[u].reduce((s, v) => s + size[v], 0);
      heavy[u] = T.children[u].reduce<string | null>((h, v) => (h === null || size[v] > size[h] ? v : h), null);
    }
    r.snap('dfs1：計算每個子樹大小（標於節點下方）', [treePanel(T, { sub: size })], 1);
    r.snap('粗線為重邊（連向子樹最大的子節點）', [treePanel(T, { sub: size, edge: (p, c) => (heavy[p] === c ? 'path' : undefined) })], 1);
    const head: Record<string, string> = {}, pos: Record<string, number> = {}, chainId: Record<string, number> = {};
    const base: string[] = [];
    let cid = -1;
    const colorOf = () => Object.fromEntries(Object.keys(head).map((x) => [x, CHAIN[chainId[x] % CHAIN.length]]));
    const P = (line: number, msg: string) => r.snap(msg, [treePanel(T, { node: colorOf(), sub: Object.fromEntries(Object.keys(pos).map((x) => [x, 'pos ' + pos[x]])), edge: (p, c) => (heavy[p] === c ? CHAIN[chainId[p] % CHAIN.length] ?? 'muted' : undefined) }), cells(base.length ? base : [''], Object.fromEntries(base.map((x, i) => [i, CHAIN[chainId[x] % CHAIN.length]])), { title: 'DFS 序（每條鏈連續）' })], line);
    const dfs2 = (u: string, h: string) => {
      if (u === h) cid++;
      head[u] = h; chainId[u] = cid; pos[u] = base.length; base.push(u);
      P(u === h ? 2 : 3, u === h ? `${u} 開啟新鏈 #${cid}` : `${u} 延續重鏈（head = ${h}）`);
      if (heavy[u]) dfs2(heavy[u]!, h);
      for (const v of T.children[u]) if (v !== heavy[u]) dfs2(v, v);
    };
    dfs2(T.root, T.root);
    if (!T.g.nodes.includes(a)) a = T.order[T.order.length - 1];
    if (!T.g.nodes.includes(b)) b = T.order[1] ?? T.root;
    const depth: Record<string, number> = { [T.root]: 0 };
    for (const v of T.order) if (T.parent[v] !== null) depth[v] = depth[T.parent[v]!] + 1;
    let x = a, y = b;
    const segs: string[] = [];
    const onPath = new Set<string>();
    while (head[x] !== head[y]) {
      if (depth[head[x]] < depth[head[y]]) [x, y] = [y, x];
      segs.push(`pos[${pos[head[x]]}..${pos[x]}]`);
      for (let k = pos[head[x]]; k <= pos[x]; k++) onPath.add(base[k]);
      r.snap(`路徑查詢：${x} 所在鏈的 head = ${head[x]} 較深，取區間 [${pos[head[x]]}, ${pos[x]}]，跳到 parent(${head[x]})`, [treePanel(T, { node: Object.fromEntries([...onPath].map((q) => [q, 'path' as Color])), sub: Object.fromEntries(T.order.map((q) => [q, 'pos ' + pos[q]])) }), cells(base, Object.fromEntries(base.map((q, i) => [i, onPath.has(q) ? 'path' : 'muted'])), { title: 'DFS 序' }), text(segs, '區間')], 5);
      x = T.parent[head[x]]!;
    }
    if (depth[x] > depth[y]) [x, y] = [y, x];
    segs.push(`pos[${pos[x]}..${pos[y]}]`);
    for (let k = pos[x]; k <= pos[y]; k++) onPath.add(base[k]);
    r.snap(`同一條鏈：取區間 [${pos[x]}, ${pos[y]}]；LCA = ${x}。路徑 ${a}–${b} 被拆成 ${segs.length} 段連續區間`, [treePanel(T, { node: { ...Object.fromEntries([...onPath].map((q) => [q, 'path' as Color])), [x]: 'done' }, sub: Object.fromEntries(T.order.map((q) => [q, 'pos ' + pos[q]])) }), cells(base, Object.fromEntries(base.map((q, i) => [i, onPath.has(q) ? 'path' : 'muted'])), { title: 'DFS 序' }), text(segs, '區間')], 5);
    return r.frames;
  },
};

export default [traversal, levelOrder, morris, diameter, lca, euler, hld];
