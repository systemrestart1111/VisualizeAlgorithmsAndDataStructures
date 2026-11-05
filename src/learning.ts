// 學習路徑與先備知識：每一項列出「直接」需要先懂的項目，畫圖時再做遞移化簡。

/** 直接先備知識（id → 需要先學的 id） */
const RAW: Record<string, string[]> = {
  // 入門
  'ds-array': [],
  'ds-dynamic-array': ['ds-array'],
  'linear-search': ['ds-array'],
  'binary-search': ['linear-search'],
  'lower-upper-bound': ['binary-search'],
  'bubble-sort': ['ds-array'],
  'selection-sort': ['ds-array'],
  'insertion-sort': ['ds-array'],
  'prefix-sum': ['ds-array'],
  fibonacci: [],
  hanoi: [],

  // 線性結構
  'ds-singly-linked-list': ['ds-array'],
  'ds-doubly-linked-list': ['ds-singly-linked-list'],
  'ds-circular-linked-list': ['ds-singly-linked-list'],
  'ds-stack': ['ds-dynamic-array'],
  'ds-queue': ['ds-singly-linked-list'],
  'ds-circular-queue': ['ds-queue', 'ds-array'],
  'ds-deque': ['ds-queue', 'ds-doubly-linked-list'],
  'll-insert-delete': ['ds-singly-linked-list'],
  'll-reverse': ['ll-insert-delete'],
  'll-middle': ['ds-singly-linked-list'],
  'll-merge-sorted': ['ll-insert-delete'],
  'll-remove-nth': ['ll-middle'],
  'floyd-cycle': ['ll-middle'],
  'cycle-entry': ['floyd-cycle'],
  'll-intersection': ['ll-middle'],
  parentheses: ['ds-stack'],
  'infix-to-postfix': ['parentheses'],
  'postfix-eval': ['ds-stack'],
  'shunting-yard': ['infix-to-postfix', 'postfix-eval'],
  'next-greater': ['ds-stack'],
  'largest-rectangle': ['next-greater'],
  'sliding-window-max': ['ds-deque', 'next-greater'],

  // 排序、搜尋與陣列技巧
  'merge-sort': ['ds-array', 'hanoi'],
  'quick-sort': ['ds-array', 'hanoi'],
  'shell-sort': ['insertion-sort'],
  'cocktail-sort': ['bubble-sort'],
  'comb-sort': ['bubble-sort'],
  'gnome-sort': ['insertion-sort'],
  'odd-even-sort': ['bubble-sort'],
  'jump-search': ['binary-search'],
  'interpolation-search': ['binary-search'],
  'exponential-search': ['binary-search'],
  'ternary-search': ['binary-search'],
  quickselect: ['quick-sort'],
  'median-of-medians': ['quickselect'],
  'dutch-flag': ['quick-sort'],
  'inplace-merge': ['merge-sort'],
  timsort: ['merge-sort', 'insertion-sort', 'binary-search'],
  'counting-sort': ['prefix-sum'],
  'radix-sort': ['counting-sort'],
  'bucket-sort': ['insertion-sort'],
  'external-merge-sort': ['merge-sort'],
  'bitonic-sort': ['merge-sort'],
  'difference-array': ['prefix-sum'],
  kadane: ['prefix-sum'],
  'boyer-moore-majority': ['linear-search'],
  'array-rotation': ['ds-array'],

  // 雜湊與樹
  'ds-hash-chaining': ['ds-array', 'ds-singly-linked-list'],
  'ds-hash-open': ['ds-hash-chaining'],
  'ds-binary-tree': ['ds-singly-linked-list'],
  'tree-traversal': ['ds-binary-tree', 'ds-stack', 'hanoi'],
  'level-order': ['ds-binary-tree', 'ds-queue'],
  'morris-traversal': ['tree-traversal'],
  'ds-bst': ['ds-binary-tree', 'binary-search'],
  'tree-sort': ['ds-bst', 'tree-traversal'],
  'ds-heap': ['ds-binary-tree'],
  'heap-sort': ['ds-heap'],
  'top-k': ['ds-heap'],
  introsort: ['quick-sort', 'heap-sort', 'insertion-sort'],
  'ds-trie': ['ds-binary-tree'],
  'ds-avl': ['ds-bst'],
  'ds-red-black': ['ds-avl'],
  'ds-splay': ['ds-avl'],
  'ds-b-tree': ['ds-bst'],
  'ds-b-plus-tree': ['ds-b-tree'],
  'ds-skip-list': ['ds-singly-linked-list', 'binary-search'],

  // 圖的走訪與結構
  'ds-graph': ['ds-dynamic-array', 'ds-singly-linked-list'],
  bfs: ['ds-graph', 'ds-queue'],
  dfs: ['ds-graph', 'ds-stack'],
  'connected-components': ['dfs'],
  'cycle-detection': ['dfs'],
  bipartite: ['bfs'],
  'topo-kahn': ['bfs'],
  'topo-dfs': ['dfs'],
  'scc-tarjan': ['connected-components'],
  'scc-kosaraju': ['topo-dfs', 'connected-components'],
  'bridges-articulation': ['dfs'],
  hierholzer: ['dfs'],
  'ds-union-find': ['connected-components'],
  'tree-diameter': ['bfs', 'ds-binary-tree'],
  'euler-tour': ['dfs', 'tree-traversal'],

  // 最短路徑與最小生成樹
  dijkstra: ['bfs', 'ds-heap'],
  'bellman-ford': ['ds-graph'],
  'floyd-warshall': ['ds-graph'],
  'dag-shortest': ['topo-dfs', 'bellman-ford'],
  'zero-one-bfs': ['dijkstra', 'ds-deque'],
  johnson: ['dijkstra', 'bellman-ford'],
  'bidirectional-bfs': ['bfs'],
  'greedy-best-first': ['bfs', 'ds-heap'],
  'a-star': ['dijkstra', 'greedy-best-first'],
  'ida-star': ['a-star', 'dfs'],
  kruskal: ['ds-union-find', 'merge-sort'],
  prim: ['ds-heap', 'ds-graph'],
  boruvka: ['ds-union-find'],

  // 回溯與遞迴搜尋
  subsets: ['hanoi'],
  combinations: ['subsets'],
  permutations: ['subsets'],
  'n-queens': ['permutations'],
  sudoku: ['n-queens'],
  'maze-dfs': ['dfs'],
  'maze-generation': ['maze-dfs'],
  'graph-coloring': ['n-queens', 'ds-graph'],
  'knights-tour': ['n-queens'],
  'hamiltonian-path': ['permutations', 'ds-graph'],
  'algorithm-x': ['sudoku', 'ds-doubly-linked-list'],
  minimax: ['tree-traversal'],
  'alpha-beta': ['minimax'],

  // 貪婪與動態規劃
  'activity-selection': ['merge-sort'],
  'interval-partitioning': ['activity-selection', 'ds-heap'],
  'fractional-knapsack': ['merge-sort'],
  huffman: ['ds-heap'],
  'job-sequencing': ['activity-selection'],
  'optimal-merge': ['huffman'],
  'climbing-stairs': ['fibonacci'],
  'coin-change': ['climbing-stairs'],
  'grid-paths': ['climbing-stairs'],
  'knapsack-01': ['grid-paths'],
  'knapsack-unbounded': ['knapsack-01', 'coin-change'],
  'knapsack-bounded': ['knapsack-01'],
  'subset-sum': ['knapsack-01'],
  lcs: ['grid-paths'],
  lis: ['climbing-stairs', 'lower-upper-bound'],
  'edit-distance': ['lcs'],
  'matrix-chain': ['grid-paths'],
  'interval-dp': ['matrix-chain', 'prefix-sum'],
  'tree-dp': ['climbing-stairs', 'dfs'],
  'bitmask-dp': ['knapsack-01', 'subsets'],
  'digit-dp': ['grid-paths'],
  'held-karp': ['bitmask-dp', 'hamiltonian-path'],
  'branch-and-bound': ['subsets', 'fractional-knapsack', 'knapsack-01'],

  // 進階資料結構與樹上演算法
  'ds-segment-tree': ['ds-binary-tree', 'prefix-sum'],
  'ds-fenwick': ['prefix-sum'],
  lca: ['dfs', 'tree-traversal'],
  hld: ['lca', 'ds-segment-tree'],

  // 網路流與匹配
  'ford-fulkerson': ['dfs'],
  'edmonds-karp': ['ford-fulkerson', 'bfs'],
  dinic: ['edmonds-karp'],
  'push-relabel': ['ford-fulkerson'],
  'min-cost-max-flow': ['edmonds-karp', 'bellman-ford'],
  'bipartite-matching': ['bipartite', 'ford-fulkerson'],
  'hopcroft-karp': ['bipartite-matching'],
  hungarian: ['bipartite-matching'],
  'gale-shapley': ['ds-queue'],

  // 字串
  'naive-match': ['linear-search'],
  kmp: ['naive-match'],
  'rolling-hash': ['prefix-sum', 'ds-hash-chaining'],
  'rabin-karp': ['naive-match', 'rolling-hash'],
  horspool: ['naive-match'],
  'boyer-moore': ['horspool', 'kmp'],
  'z-algorithm': ['naive-match'],
  'aho-corasick': ['kmp', 'ds-trie', 'bfs'],
  manacher: ['z-algorithm'],
  'suffix-array': ['radix-sort', 'naive-match'],
  'kasai-lcp': ['suffix-array'],

  // 數學與幾何
  gcd: [],
  'extended-gcd': ['gcd'],
  lcm: ['gcd'],
  sieve: ['ds-array'],
  'linear-sieve': ['sieve'],
  'segmented-sieve': ['sieve'],
  'prime-factorization': ['sieve'],
  'fast-power': ['hanoi'],
  'mod-pow': ['fast-power'],
  'mod-inverse': ['extended-gcd', 'mod-pow'],
  crt: ['mod-inverse'],
  'miller-rabin': ['mod-pow'],
  'matrix-power': ['fast-power', 'fibonacci'],
  fft: ['fast-power', 'merge-sort'],
  'cross-product': [],
  'segment-intersection': ['cross-product'],
  'point-in-polygon': ['segment-intersection'],
  'graham-scan': ['cross-product', 'ds-stack', 'merge-sort'],
  'monotone-chain': ['graham-scan'],
  'jarvis-march': ['cross-product'],
  'closest-pair': ['merge-sort'],
  'sweep-line': ['merge-sort', 'ds-segment-tree'],
  'rotating-calipers': ['monotone-chain'],
  'polygon-clipping': ['segment-intersection'],
  voronoi: ['polygon-clipping'],
  delaunay: ['cross-product'],

  // 隨機化與應用
  'fisher-yates': ['ds-array'],
  'reservoir-sampling': ['fisher-yates'],
  'randomized-quickselect': ['quickselect', 'fisher-yates'],
  'monte-carlo-pi': [],
  'random-walk': ['monte-carlo-pi'],
  mcts: ['alpha-beta', 'monte-carlo-pi'],
  rle: ['ds-array'],
  lz77: ['rle', 'naive-match'],
  lz78: ['rle', 'ds-trie'],
  lzw: ['lz78'],
  'arithmetic-coding': ['huffman'],
  bisection: ['binary-search'],
  'newton-method': ['bisection'],
  'gradient-descent': ['newton-method'],
  'gaussian-elimination': ['ds-array'],
  'k-nn': ['top-k'],
  'k-means': ['k-nn'],
  pagerank: ['ds-graph', 'gaussian-elimination'],
};

export interface Stage {
  id: string;
  name: string;
  desc: string;
  items: string[];
}

/** 建議的學習順序：每個項目只出現在一個階段，且其先備知識都在同一或更早的階段 */
export const STAGES: Stage[] = [
  {
    id: 'basics', name: '入門基礎', desc: '先熟悉陣列與遞迴，再用最直觀的搜尋和排序建立「步數」的感覺。',
    items: ['ds-array', 'ds-dynamic-array', 'linear-search', 'binary-search', 'lower-upper-bound', 'bubble-sort', 'selection-sort', 'insertion-sort', 'prefix-sum', 'fibonacci', 'hanoi'],
  },
  {
    id: 'linear', name: '線性結構', desc: '用指標串起節點：鏈結串列、堆疊、佇列，以及快慢指標和單調堆疊等技巧。',
    items: ['ds-singly-linked-list', 'ds-doubly-linked-list', 'ds-circular-linked-list', 'ds-stack', 'ds-queue', 'ds-circular-queue', 'ds-deque', 'll-insert-delete', 'll-reverse', 'll-middle', 'll-merge-sorted', 'll-remove-nth', 'floyd-cycle', 'cycle-entry', 'll-intersection', 'parentheses', 'infix-to-postfix', 'postfix-eval', 'shunting-yard', 'next-greater', 'largest-rectangle', 'sliding-window-max'],
  },
  {
    id: 'sorting', name: '排序與搜尋', desc: '分治法帶來 O(n log n) 排序；再看非比較排序、各種搜尋變形與常見陣列技巧。',
    items: ['merge-sort', 'quick-sort', 'shell-sort', 'cocktail-sort', 'comb-sort', 'gnome-sort', 'odd-even-sort', 'jump-search', 'interpolation-search', 'exponential-search', 'ternary-search', 'quickselect', 'median-of-medians', 'dutch-flag', 'inplace-merge', 'timsort', 'counting-sort', 'radix-sort', 'bucket-sort', 'external-merge-sort', 'bitonic-sort', 'difference-array', 'kadane', 'boyer-moore-majority', 'array-rotation'],
  },
  {
    id: 'trees', name: '雜湊與樹', desc: '雜湊表做到平均 O(1) 查找；從二元樹出發，認識搜尋樹、平衡樹、堆積與字典樹。',
    items: ['ds-hash-chaining', 'ds-hash-open', 'ds-binary-tree', 'tree-traversal', 'level-order', 'morris-traversal', 'ds-bst', 'tree-sort', 'ds-heap', 'heap-sort', 'top-k', 'introsort', 'ds-trie', 'ds-avl', 'ds-red-black', 'ds-splay', 'ds-b-tree', 'ds-b-plus-tree', 'ds-skip-list'],
  },
  {
    id: 'graphs', name: '圖的走訪', desc: 'BFS 與 DFS 是圖論的兩大基石，延伸出連通分量、拓撲排序、強連通分量與並查集。',
    items: ['ds-graph', 'bfs', 'dfs', 'connected-components', 'cycle-detection', 'bipartite', 'topo-kahn', 'topo-dfs', 'scc-tarjan', 'scc-kosaraju', 'bridges-articulation', 'hierholzer', 'ds-union-find', 'tree-diameter', 'euler-tour'],
  },
  {
    id: 'paths', name: '最短路徑與生成樹', desc: '在加權圖上找最短路徑與最小生成樹，並用啟發式函數加速搜尋。',
    items: ['dijkstra', 'bellman-ford', 'floyd-warshall', 'dag-shortest', 'zero-one-bfs', 'johnson', 'bidirectional-bfs', 'greedy-best-first', 'a-star', 'ida-star', 'kruskal', 'prim', 'boruvka'],
  },
  {
    id: 'backtrack', name: '回溯搜尋', desc: '系統性地列舉所有可能並及早剪枝：排列組合、N 皇后、數獨，以及博弈樹搜尋。',
    items: ['subsets', 'combinations', 'permutations', 'n-queens', 'sudoku', 'maze-dfs', 'maze-generation', 'graph-coloring', 'knights-tour', 'hamiltonian-path', 'algorithm-x', 'minimax', 'alpha-beta'],
  },
  {
    id: 'greedy-dp', name: '貪婪與動態規劃', desc: '貪婪每步選當下最好；動態規劃把問題拆成重疊子問題，從一維到區間、樹形與狀態壓縮。',
    items: ['activity-selection', 'interval-partitioning', 'fractional-knapsack', 'huffman', 'job-sequencing', 'optimal-merge', 'climbing-stairs', 'coin-change', 'grid-paths', 'knapsack-01', 'knapsack-unbounded', 'knapsack-bounded', 'subset-sum', 'lcs', 'lis', 'edit-distance', 'matrix-chain', 'interval-dp', 'tree-dp', 'bitmask-dp', 'digit-dp', 'held-karp', 'branch-and-bound'],
  },
  {
    id: 'advanced', name: '進階資料結構', desc: '區間查詢與更新的利器：線段樹、樹狀陣列，以及最近共同祖先與樹鏈剖分。',
    items: ['ds-segment-tree', 'ds-fenwick', 'lca', 'hld'],
  },
  {
    id: 'flow', name: '網路流與匹配', desc: '增廣路徑求最大流，並把指派、配對問題轉成流量或匹配問題。',
    items: ['ford-fulkerson', 'edmonds-karp', 'dinic', 'push-relabel', 'min-cost-max-flow', 'bipartite-matching', 'hopcroft-karp', 'hungarian', 'gale-shapley'],
  },
  {
    id: 'strings', name: '字串演算法', desc: '從暴力匹配到 KMP、Z 函數與 AC 自動機，再到後綴陣列。',
    items: ['naive-match', 'kmp', 'rolling-hash', 'rabin-karp', 'horspool', 'boyer-moore', 'z-algorithm', 'aho-corasick', 'manacher', 'suffix-array', 'kasai-lcp'],
  },
  {
    id: 'math-geo', name: '數學與幾何', desc: '數論工具（最大公因數、質數篩、模運算、FFT）與以叉積為核心的計算幾何。',
    items: ['gcd', 'extended-gcd', 'lcm', 'sieve', 'linear-sieve', 'segmented-sieve', 'prime-factorization', 'fast-power', 'mod-pow', 'mod-inverse', 'crt', 'miller-rabin', 'matrix-power', 'fft', 'cross-product', 'segment-intersection', 'point-in-polygon', 'graham-scan', 'monotone-chain', 'jarvis-march', 'closest-pair', 'sweep-line', 'rotating-calipers', 'polygon-clipping', 'voronoi', 'delaunay'],
  },
  {
    id: 'applied', name: '隨機化與應用', desc: '隨機抽樣、資料壓縮、數值方法與機器學習入門，把前面學到的工具用在實際問題上。',
    items: ['fisher-yates', 'reservoir-sampling', 'randomized-quickselect', 'monte-carlo-pi', 'random-walk', 'mcts', 'rle', 'lz77', 'lz78', 'lzw', 'arithmetic-coding', 'bisection', 'newton-method', 'gradient-descent', 'gaussian-elimination', 'k-nn', 'k-means', 'pagerank'],
  },
];

export const STAGE_OF: Record<string, number> = Object.fromEntries(STAGES.flatMap((s, i) => s.items.map((id) => [id, i])));

/** 所有先備知識（遞移閉包，不含自己） */
const closure: Record<string, Set<string>> = {};
function ancestorsOf(id: string): Set<string> {
  if (closure[id]) return closure[id];
  const s = new Set<string>();
  closure[id] = s; // 先放入，避免環狀定義造成無窮遞迴（測試會另外檢查環）
  for (const p of RAW[id] ?? []) {
    s.add(p);
    for (const q of ancestorsOf(p)) s.add(q);
  }
  return s;
}

/** 遞移化簡後的直接先備：若 p 已經是另一個先備 q 的先備，就不再畫 p → id */
export const REQ: Record<string, string[]> = Object.fromEntries(
  Object.entries(RAW).map(([id, ps]) => [id, ps.filter((p) => !ps.some((q) => q !== p && ancestorsOf(q).has(p)))]),
);

/** 反向：學完 id 之後可以接著學的項目 */
export const NEXT: Record<string, string[]> = Object.fromEntries(Object.keys(RAW).map((id) => [id, [] as string[]]));
for (const [id, ps] of Object.entries(REQ)) for (const p of ps) NEXT[p].push(id);

export const RAW_REQ = RAW;
export const ancestors = (id: string) => ancestorsOf(id);

/** 學某一項之前的建議順序：所有先備依「層級 → 階段 → 原定順序」排成一列，最後是自己 */
export function studyOrder(id: string): string[] {
  const set = [...ancestorsOf(id), id];
  const lv = levels(set);
  const pos = (x: string) => STAGES[STAGE_OF[x]].items.indexOf(x);
  return set.sort((a, b) => lv[a] - lv[b] || STAGE_OF[a] - STAGE_OF[b] || pos(a) - pos(b));
}

/** 在集合內的層級：沒有先備的為 0，否則為最深先備 + 1 */
export function levels(ids: string[]): Record<string, number> {
  const inSet = new Set(ids);
  const lv: Record<string, number> = {};
  const go = (x: string): number => {
    if (lv[x] !== undefined) return lv[x];
    const ps = REQ[x].filter((p) => inSet.has(p));
    return (lv[x] = ps.length ? 1 + Math.max(...ps.map(go)) : 0);
  };
  ids.forEach(go);
  return lv;
}
