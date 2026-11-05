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

  // 擴充主題（依擴充清單的先備關係）
  // @ext-raw-begin
  'concept-bits': ['ds-array'],
  'concept-modular': ['ds-array'],
  'concept-probability': [],
  'concept-matrix': ['ds-array'],
  'concept-calculus': [],
  'second-largest': ['linear-search'],
  'recursive-bubble-sort': ['bubble-sort', 'hanoi'],
  'cycle-sort': ['selection-sort'],
  'binary-insertion-sort': ['insertion-sort', 'lower-upper-bound'],
  'pancake-sort': ['selection-sort', 'array-rotation'],
  'msd-radix-sort': ['radix-sort', 'hanoi'],
  'two-pointers': ['ds-array'],
  'sliding-window': ['ds-array'],
  'trapping-rain-water': ['two-pointers'],
  'prefix-sum-2d': ['prefix-sum'],
  'difference-2d': ['difference-array', 'prefix-sum-2d'],
  'inversion-count': ['merge-sort'],
  'coordinate-compression': ['merge-sort', 'lower-upper-bound'],
  'interval-merge': ['merge-sort'],
  'binary-search-answer': ['binary-search'],
  'rotated-array-search': ['binary-search'],
  'two-sorted-median': ['binary-search'],
  'next-permutation': ['ds-array'],
  'subarray-sum-k': ['prefix-sum', 'ds-hash-chaining'],
  'cuckoo-hashing': ['ds-hash-open'],
  'robin-hood-hashing': ['ds-hash-open'],
  'lru-cache': ['ds-hash-chaining', 'ds-doubly-linked-list'],
  'lfu-cache': ['lru-cache'],
  'bloom-filter': ['ds-hash-chaining', 'concept-bits', 'concept-probability'],
  'counting-bloom': ['bloom-filter'],
  'count-min-sketch': ['ds-hash-chaining', 'concept-probability'],
  hyperloglog: ['ds-hash-chaining', 'concept-bits', 'concept-probability'],
  'streaming-median': ['ds-heap'],
  'multiway-merge': ['merge-sort', 'ds-heap'],
  'patience-sort': ['lower-upper-bound', 'ds-heap'],
  treap: ['ds-bst', 'ds-heap', 'concept-probability'],
  'order-statistic-tree': ['ds-avl'],
  'binary-trie': ['ds-trie', 'concept-bits'],
  'radix-tree': ['ds-trie'],
  quadtree: ['ds-binary-tree'],
  'multi-source-bfs': ['bfs'],
  iddfs: ['dfs'],
  'transitive-closure': ['ds-graph'],
  'dag-longest-path': ['topo-kahn'],
  'critical-path': ['dag-longest-path'],
  'two-sat': ['scc-tarjan'],
  'weighted-dsu': ['ds-union-find'],
  'rollback-dsu': ['ds-union-find', 'ds-stack'],
  'yen-k-shortest': ['dijkstra', 'ds-heap'],
  'karger-min-cut': ['ds-union-find', 'concept-probability'],
  'stoer-wagner': ['ds-graph', 'ds-heap'],
  'meet-in-middle': ['subsets', 'binary-search'],
  'rod-cutting': ['climbing-stairs'],
  'egg-dropping': ['climbing-stairs'],
  'weighted-interval-scheduling': ['activity-selection', 'binary-search', 'climbing-stairs'],
  'word-break': ['ds-trie', 'climbing-stairs'],
  'longest-common-substring': ['lcs'],
  'longest-palindromic-subsequence': ['interval-dp'],
  'palindrome-partition': ['interval-dp'],
  'optimal-bst': ['ds-bst', 'interval-dp'],
  'divide-conquer-dp': ['interval-dp'],
  'knuth-optimization': ['interval-dp'],
  'sos-dp': ['bitmask-dp', 'concept-bits'],
  'profile-dp': ['bitmask-dp'],
  'sparse-table': ['ds-array'],
  'sqrt-decomposition': ['prefix-sum'],
  'persistent-segment-tree': ['ds-segment-tree'],
  'li-chao-tree': ['ds-segment-tree'],
  'fenwick-2d': ['ds-fenwick', 'prefix-sum-2d'],
  'mo-algorithm': ['sqrt-decomposition', 'coordinate-compression'],
  'offline-dynamic-connectivity': ['rollback-dsu', 'ds-segment-tree'],
  'tarjan-offline-lca': ['dfs', 'ds-union-find'],
  'second-best-mst': ['kruskal', 'lca'],
  'rerooting-dp': ['tree-dp'],
  'centroid-decomposition': ['tree-traversal'],
  'edmonds-blossom': ['bipartite-matching', 'bfs'],
  'shift-and': ['naive-match', 'concept-bits'],
  eertree: ['ds-trie', 'manacher'],
  'suffix-automaton': ['ds-trie', 'ds-graph'],
  'ukkonen-suffix-tree': ['radix-tree', 'suffix-array'],
  bwt: ['suffix-array'],
  'move-to-front': ['ds-array'],
  'fm-index': ['bwt', 'prefix-sum'],
  'canonical-huffman': ['huffman'],
  'thompson-nfa': ['ds-stack', 'ds-graph'],
  'subset-construction': ['thompson-nfa', 'subsets', 'bfs'],
  'hopcroft-minimization': ['subset-construction'],
  'euler-totient': ['prime-factorization'],
  'mobius-sieve': ['linear-sieve', 'prime-factorization'],
  'mobius-inversion': ['mobius-sieve'],
  'lucas-theorem': ['combinations', 'mod-inverse'],
  'discrete-log-bsgs': ['mod-pow', 'mod-inverse', 'ds-hash-chaining'],
  'pollard-rho': ['gcd', 'mod-pow', 'floyd-cycle', 'miller-rabin'],
  ntt: ['fft', 'mod-pow', 'mod-inverse'],
  shoelace: ['cross-product'],
  'ear-clipping': ['point-in-polygon', 'cross-product'],
  quickhull: ['cross-product', 'hanoi'],
  'kd-tree': ['ds-bst', 'cross-product'],
  'bentley-ottmann': ['sweep-line', 'ds-bst', 'ds-heap', 'segment-intersection'],
  'half-plane-intersection': ['cross-product', 'ds-deque', 'merge-sort'],
  'convex-hull-trick': ['cross-product', 'ds-deque'],
  'fortune-voronoi': ['voronoi', 'ds-bst', 'ds-heap'],
  'caesar-cipher': ['concept-modular'],
  'vigenere-cipher': ['caesar-cipher'],
  'affine-cipher': ['caesar-cipher', 'mod-inverse'],
  'rail-fence-cipher': ['ds-array'],
  'columnar-transposition': ['ds-array', 'merge-sort'],
  'playfair-cipher': ['ds-array'],
  'frequency-analysis': ['caesar-cipher'],
  'one-time-pad': ['concept-bits', 'concept-probability'],
  'hill-cipher': ['concept-matrix', 'mod-inverse', 'concept-modular'],
  'rsa-cipher': ['mod-pow', 'mod-inverse', 'prime-factorization', 'concept-modular'],
  'diffie-hellman': ['mod-pow', 'concept-modular'],
  'concept-finite-field': ['concept-modular', 'concept-bits'],
  aes: ['concept-finite-field', 'concept-matrix'],
  'block-modes': ['aes', 'concept-bits'],
  sha256: ['concept-bits'],
  hmac: ['sha256'],
  'rsa-signature': ['rsa-cipher', 'sha256'],
  'secant-method': ['bisection'],
  'simpson-rule': ['concept-calculus'],
  'runge-kutta-4': ['concept-calculus'],
  'gauss-jordan': ['gaussian-elimination'],
  'lu-decomposition': ['gaussian-elimination'],
  'qr-decomposition': ['concept-matrix'],
  'concept-eigen': ['concept-matrix'],
  'power-iteration': ['concept-eigen'],
  'conjugate-gradient': ['concept-matrix', 'concept-calculus'],
  'simplex-lp': ['gaussian-elimination'],
  'image-convolution': ['concept-matrix'],
  'gaussian-blur': ['image-convolution'],
  'median-filter': ['image-convolution', 'quickselect'],
  sobel: ['image-convolution', 'concept-calculus'],
  'nonmaximum-suppression': ['ds-array'],
  canny: ['gaussian-blur', 'sobel', 'nonmaximum-suppression', 'bfs'],
  'harris-corner': ['sobel', 'gaussian-blur', 'concept-matrix', 'nonmaximum-suppression'],
  'shi-tomasi': ['harris-corner', 'concept-eigen'],
  otsu: ['concept-probability', 'ds-array'],
  'histogram-equalization': ['prefix-sum'],
  clahe: ['histogram-equalization'],
  morphology: ['concept-matrix'],
  'flood-fill': ['bfs'],
  'image-components': ['ds-union-find', 'concept-matrix'],
  'distance-transform': ['multi-source-bfs'],
  watershed: ['ds-heap', 'image-components'],
  'hough-lines': ['sobel', 'concept-matrix'],
  ransac: ['concept-probability', 'gaussian-elimination'],
  'lucas-kanade': ['sobel', 'gaussian-elimination'],
  'seam-carving': ['sobel', 'grid-paths'],
  'alias-method': ['concept-probability', 'ds-array'],
  'linear-regression': ['gradient-descent', 'concept-matrix'],
  'logistic-regression': ['gradient-descent', 'concept-probability'],
  'naive-bayes': ['concept-probability'],
  'decision-tree': ['concept-probability', 'ds-binary-tree'],
  dbscan: ['bfs'],
  'agglomerative-clustering': ['ds-heap'],
  pca: ['concept-eigen', 'concept-probability'],
  backpropagation: ['concept-calculus', 'concept-matrix', 'gradient-descent'],
  sgd: ['gradient-descent', 'concept-probability'],
  adam: ['sgd'],
  'simulated-annealing': ['concept-probability'],
  'genetic-algorithm': ['concept-probability', 'fisher-yates'],
  // @ext-raw-end
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
    id: 'basics', name: '入門基礎', desc: '先熟悉陣列、遞迴與基本數學工具，再用最直觀的搜尋和排序建立「步數」的感覺。',
    items: ['ds-array', 'ds-dynamic-array', 'concept-bits', 'concept-modular', 'concept-probability', 'concept-matrix', 'concept-calculus', 'linear-search', 'second-largest', 'binary-search', 'lower-upper-bound', 'bubble-sort', 'recursive-bubble-sort', 'selection-sort', 'cycle-sort', 'insertion-sort', 'binary-insertion-sort', 'prefix-sum', 'fibonacci', 'hanoi'],
  },
  {
    id: 'linear', name: '線性結構', desc: '用指標串起節點：鏈結串列、堆疊、佇列，以及快慢指標和單調堆疊等技巧。',
    items: ['ds-singly-linked-list', 'ds-doubly-linked-list', 'ds-circular-linked-list', 'ds-stack', 'ds-queue', 'ds-circular-queue', 'ds-deque', 'll-insert-delete', 'll-reverse', 'll-middle', 'll-merge-sorted', 'll-remove-nth', 'floyd-cycle', 'cycle-entry', 'll-intersection', 'parentheses', 'infix-to-postfix', 'postfix-eval', 'shunting-yard', 'next-greater', 'largest-rectangle', 'sliding-window-max'],
  },
  {
    id: 'sorting', name: '排序與搜尋', desc: '分治法帶來 O(n log n) 排序；再看非比較排序、各種搜尋變形與常見陣列技巧。',
    items: ['merge-sort', 'quick-sort', 'shell-sort', 'cocktail-sort', 'comb-sort', 'gnome-sort', 'odd-even-sort', 'pancake-sort', 'jump-search', 'interpolation-search', 'exponential-search', 'ternary-search', 'quickselect', 'median-of-medians', 'dutch-flag', 'inplace-merge', 'timsort', 'counting-sort', 'radix-sort', 'msd-radix-sort', 'bucket-sort', 'external-merge-sort', 'bitonic-sort', 'difference-array', 'kadane', 'boyer-moore-majority', 'array-rotation'],
  },
  {
    id: 'techniques', name: '陣列解題技巧', desc: '雙指標、滑動視窗、二維前綴和、座標壓縮與答案二分：把陣列題目化繁為簡的常用套路。',
    items: ['two-pointers', 'sliding-window', 'trapping-rain-water', 'prefix-sum-2d', 'difference-2d', 'inversion-count', 'coordinate-compression', 'interval-merge', 'binary-search-answer', 'rotated-array-search', 'two-sorted-median', 'next-permutation'],
  },
  {
    id: 'trees', name: '雜湊與樹', desc: '雜湊表做到平均 O(1) 查找；從二元樹出發，認識搜尋樹、平衡樹、堆積與字典樹。',
    items: ['ds-hash-chaining', 'ds-hash-open', 'ds-binary-tree', 'tree-traversal', 'level-order', 'morris-traversal', 'ds-bst', 'tree-sort', 'ds-heap', 'heap-sort', 'top-k', 'introsort', 'ds-trie', 'ds-avl', 'ds-red-black', 'ds-splay', 'ds-b-tree', 'ds-b-plus-tree', 'ds-skip-list'],
  },
  {
    id: 'ds-more', name: '雜湊、快取與機率結構', desc: '雜湊表的變形（布穀鳥、羅賓漢）、LRU／LFU 快取、布隆過濾器等機率結構，以及更多樹與堆積的應用。',
    items: ['subarray-sum-k', 'cuckoo-hashing', 'robin-hood-hashing', 'lru-cache', 'lfu-cache', 'bloom-filter', 'counting-bloom', 'count-min-sketch', 'hyperloglog', 'streaming-median', 'multiway-merge', 'patience-sort', 'treap', 'order-statistic-tree', 'binary-trie', 'radix-tree', 'quadtree'],
  },
  {
    id: 'graphs', name: '圖的走訪', desc: 'BFS 與 DFS 是圖論的兩大基石，延伸出連通分量、拓撲排序、強連通分量與並查集。',
    items: ['ds-graph', 'bfs', 'multi-source-bfs', 'dfs', 'iddfs', 'connected-components', 'cycle-detection', 'bipartite', 'transitive-closure', 'topo-kahn', 'topo-dfs', 'dag-longest-path', 'critical-path', 'scc-tarjan', 'scc-kosaraju', 'two-sat', 'bridges-articulation', 'hierholzer', 'ds-union-find', 'weighted-dsu', 'rollback-dsu', 'tree-diameter', 'euler-tour'],
  },
  {
    id: 'paths', name: '最短路徑與生成樹', desc: '在加權圖上找最短路徑、最小生成樹與最小割，並用啟發式函數加速搜尋。',
    items: ['dijkstra', 'yen-k-shortest', 'bellman-ford', 'floyd-warshall', 'dag-shortest', 'zero-one-bfs', 'johnson', 'bidirectional-bfs', 'greedy-best-first', 'a-star', 'ida-star', 'kruskal', 'prim', 'boruvka', 'karger-min-cut', 'stoer-wagner'],
  },
  {
    id: 'backtrack', name: '回溯搜尋', desc: '系統性地列舉所有可能並及早剪枝：排列組合、N 皇后、數獨、折半搜尋，以及博弈樹搜尋。',
    items: ['subsets', 'combinations', 'permutations', 'meet-in-middle', 'n-queens', 'sudoku', 'maze-dfs', 'maze-generation', 'graph-coloring', 'knights-tour', 'hamiltonian-path', 'algorithm-x', 'minimax', 'alpha-beta'],
  },
  {
    id: 'greedy-dp', name: '貪婪與動態規劃', desc: '貪婪每步選當下最好；動態規劃把問題拆成重疊子問題，從一維到區間、樹形、狀態壓縮與決策最佳化。',
    items: ['activity-selection', 'interval-partitioning', 'fractional-knapsack', 'huffman', 'job-sequencing', 'optimal-merge', 'climbing-stairs', 'coin-change', 'rod-cutting', 'egg-dropping', 'weighted-interval-scheduling', 'word-break', 'grid-paths', 'knapsack-01', 'knapsack-unbounded', 'knapsack-bounded', 'subset-sum', 'lcs', 'longest-common-substring', 'lis', 'edit-distance', 'matrix-chain', 'interval-dp', 'longest-palindromic-subsequence', 'palindrome-partition', 'optimal-bst', 'divide-conquer-dp', 'knuth-optimization', 'tree-dp', 'bitmask-dp', 'sos-dp', 'profile-dp', 'digit-dp', 'held-karp', 'branch-and-bound'],
  },
  {
    id: 'advanced', name: '進階資料結構', desc: '區間查詢與更新的利器：線段樹、樹狀陣列、稀疏表與分塊，以及持久化、離線處理與各種樹上技巧。',
    items: ['sparse-table', 'sqrt-decomposition', 'ds-segment-tree', 'persistent-segment-tree', 'li-chao-tree', 'ds-fenwick', 'fenwick-2d', 'mo-algorithm', 'offline-dynamic-connectivity', 'lca', 'tarjan-offline-lca', 'second-best-mst', 'hld', 'rerooting-dp', 'centroid-decomposition'],
  },
  {
    id: 'flow', name: '網路流與匹配', desc: '增廣路徑求最大流，並把指派、配對問題轉成流量或匹配問題；一般圖則需要花朵演算法。',
    items: ['ford-fulkerson', 'edmonds-karp', 'dinic', 'push-relabel', 'min-cost-max-flow', 'bipartite-matching', 'hopcroft-karp', 'hungarian', 'gale-shapley', 'edmonds-blossom'],
  },
  {
    id: 'strings', name: '字串與編碼', desc: '從暴力匹配到 KMP、Z 函數與 AC 自動機，再到後綴結構、自動機與壓縮轉換。',
    items: ['naive-match', 'shift-and', 'kmp', 'rolling-hash', 'rabin-karp', 'horspool', 'boyer-moore', 'z-algorithm', 'aho-corasick', 'manacher', 'eertree', 'suffix-array', 'kasai-lcp', 'suffix-automaton', 'ukkonen-suffix-tree', 'bwt', 'move-to-front', 'fm-index', 'canonical-huffman', 'thompson-nfa', 'subset-construction', 'hopcroft-minimization'],
  },
  {
    id: 'math-geo', name: '數學與幾何', desc: '數論工具（最大公因數、質數篩、模運算、FFT／NTT）與以叉積為核心的計算幾何。',
    items: ['gcd', 'extended-gcd', 'lcm', 'sieve', 'linear-sieve', 'segmented-sieve', 'prime-factorization', 'euler-totient', 'mobius-sieve', 'mobius-inversion', 'fast-power', 'mod-pow', 'mod-inverse', 'crt', 'lucas-theorem', 'discrete-log-bsgs', 'miller-rabin', 'pollard-rho', 'matrix-power', 'fft', 'ntt', 'cross-product', 'shoelace', 'segment-intersection', 'point-in-polygon', 'ear-clipping', 'graham-scan', 'monotone-chain', 'jarvis-march', 'quickhull', 'closest-pair', 'kd-tree', 'sweep-line', 'bentley-ottmann', 'rotating-calipers', 'polygon-clipping', 'half-plane-intersection', 'convex-hull-trick', 'voronoi', 'fortune-voronoi', 'delaunay'],
  },
  {
    id: 'crypto', name: '密碼學', desc: '從古典替換、換位密碼到 RSA、Diffie–Hellman、AES 與 SHA-256：看懂現代加密、雜湊與簽章的組成。',
    items: ['caesar-cipher', 'vigenere-cipher', 'affine-cipher', 'rail-fence-cipher', 'columnar-transposition', 'playfair-cipher', 'frequency-analysis', 'one-time-pad', 'hill-cipher', 'rsa-cipher', 'diffie-hellman', 'concept-finite-field', 'aes', 'block-modes', 'sha256', 'hmac', 'rsa-signature'],
  },
  {
    id: 'numeric', name: '數值方法與線性代數', desc: '求根、數值積分與微分方程，矩陣分解與特徵值，以及線性規劃：用近似計算解連續問題。',
    items: ['bisection', 'secant-method', 'newton-method', 'simpson-rule', 'runge-kutta-4', 'gaussian-elimination', 'gauss-jordan', 'lu-decomposition', 'qr-decomposition', 'concept-eigen', 'power-iteration', 'conjugate-gradient', 'gradient-descent', 'simplex-lp'],
  },
  {
    id: 'image', name: '影像處理', desc: '把影像看成數字矩陣：卷積濾波、邊緣與角點偵測、二值化、形態學、分割與光流。',
    items: ['image-convolution', 'gaussian-blur', 'median-filter', 'sobel', 'nonmaximum-suppression', 'canny', 'harris-corner', 'shi-tomasi', 'otsu', 'histogram-equalization', 'clahe', 'morphology', 'flood-fill', 'image-components', 'distance-transform', 'watershed', 'hough-lines', 'ransac', 'lucas-kanade', 'seam-carving'],
  },
  {
    id: 'applied', name: '隨機化與應用', desc: '隨機抽樣、資料壓縮與網頁排名，把前面學到的工具用在實際問題上。',
    items: ['fisher-yates', 'reservoir-sampling', 'randomized-quickselect', 'monte-carlo-pi', 'random-walk', 'alias-method', 'mcts', 'rle', 'lz77', 'lz78', 'lzw', 'arithmetic-coding', 'pagerank'],
  },
  {
    id: 'ml', name: '機器學習與隨機最佳化', desc: '迴歸、分類、分群與降維，反向傳播與各種最佳化器，以及模擬退火、遺傳演算法等隨機搜尋。',
    items: ['k-nn', 'k-means', 'linear-regression', 'logistic-regression', 'naive-bayes', 'decision-tree', 'dbscan', 'agglomerative-clustering', 'pca', 'backpropagation', 'sgd', 'adam', 'simulated-annealing', 'genetic-algorithm'],
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
