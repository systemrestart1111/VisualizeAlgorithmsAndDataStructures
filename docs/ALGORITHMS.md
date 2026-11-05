# 演算法與資料結構清單

## 附錄檢核結果

附錄 20 類中的項目已**全部整合**進程式，並保留原本清單中附錄沒有的項目（河內塔、迷宮生成、遞迴樹等）。整合時的處理方式如下：

### 合併或調整的項目

| 附錄項目 | 處理方式 |
|---|---|
| 活動選擇、區間排程 | 兩者是同一個貪婪問題（選出最多不重疊區間），合併為「活動選擇／區間排程」 |
| 中序轉後序、Shunting Yard | 拆成兩項：「中序轉後序」示範基本轉換；「Shunting Yard（直接求值）」為完整版，支援函式、逗號參數、一元負號，並以雙堆疊直接算出結果 |
| 快速冪、模冪 | 拆成兩種變體：快速冪為由低位到高位（大整數）；模冪為由高位到低位的平方乘法（取模） |
| FFT／NTT | 實作 FFT 多項式乘法（位元反轉 + 蝴蝶運算）；NTT 結構相同只是改在模質數下運算，於說明中註明，未另做一項 |
| 滾動雜湊 | 與 Rabin–Karp 分開：示範前綴雜湊 O(1) 取子字串雜湊，用來找重複子字串 |
| 樹操作：BST 搜尋／插入／刪除、AVL 旋轉、紅黑樹修復、堆積建構／上浮／下沉 | 放在資料結構分類 D3，以互動操作逐步呈現（可自行輸入值插入、刪除），不重複做成演算法頁 |
| 鏈結串列插入與刪除 | 同時有演算法頁（指標改接順序）與資料結構頁（D1 互動操作） |
| 跳躍串列的隨機層級建構 | 實作為資料結構 D4「跳躍串列」 |
| 區間 DP／樹形 DP／狀態壓縮 DP／數位 DP | 各選一個經典題：石子合併、樹上最大權獨立集、指派問題、數字和計數（附暴力驗證） |
| 掃描線 | 以「矩形聯集面積」示範掃描線技巧（未實作 Bentley–Ottmann 線段交點） |
| Voronoi Diagram | 以「垂直平分線半平面裁切」建構，非 Fortune 演算法 |
| 精確覆蓋 Algorithm X／Dancing Links | 以關聯矩陣呈現 cover／uncover 的刪除與還原過程 |
| 蒙地卡羅估算 | 以估算 π 為例，並畫出收斂曲線 |
| Monte Carlo Tree Search | 以井字棋盤面為例（UCT） |
| Minimax、Alpha–Beta | 使用同一棵可自訂葉節點分數的博弈樹，方便比較剪枝效果 |

### 原清單額外保留的項目

河內塔、迷宮生成（遞迴回溯）、Fibonacci 遞迴樹（與記憶化比較）、以及 D1～D4 共 25 種資料結構。

## 驗證方式

- `npm test`：對每個項目以預設輸入與 6 組隨機輸入執行，檢查無例外、虛擬碼行號有效；排序類檢查結果已排序；並對 AVL、紅黑樹、伸展樹、B／B+ 樹、跳躍串列、雜湊表、線段樹、樹狀陣列、堆積做隨機操作，與參考集合比對並檢查結構不變量。
- 另外以暴力法交叉驗證：最大流（四種演算法結果一致）、字串匹配（五種演算法）、凸包（三種）、最近點對、數位 DP、TSP。

## 完整清單（由程式自動產生）

共 **25** 種資料結構、**184** 種演算法，合計 **209** 項。★ 為附錄標記的重點項目。

### D1. 線性資料結構（9）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 陣列 | Array | 存取 a[i] O(1)；搜尋 O(n)；插入／刪除（中間） O(n)；空間 O(n) |
| ★ 動態陣列 | Dynamic Array (Vector / ArrayList) | 存取 O(1)；push（尾端加入） 均攤 O(1)；pop（尾端移除） 均攤 O(1)；中間插入／刪除 O(n) |
| ★ 單向鏈結串列 | Singly Linked List | 存取第 i 個 O(n)；頭端插入／刪除 O(1)；尾端插入（有 tail） O(1)；搜尋 O(n) |
| ★ 雙向鏈結串列 | Doubly Linked List | 存取第 i 個 O(n)；兩端插入／刪除 O(1)；刪除已知節點 O(1)；搜尋 O(n) |
| 環狀鏈結串列 | Circular Linked List | 頭／尾插入（有 tail） O(1)；刪除 O(n)；走訪一圈 O(n) |
| ★ 堆疊 | Stack | push O(1)；pop O(1)；peek O(1) |
| ★ 佇列 | Queue | enqueue O(1)；dequeue O(1)；front O(1) |
| 環狀佇列 | Circular Queue (Ring Buffer) | enqueue O(1)；dequeue O(1)；空間 O(容量) |
| 雙端佇列 | Deque (Double-Ended Queue) | pushFront / pushBack O(1)；popFront / popBack O(1) |

### D2. 雜湊表（2）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 雜湊表：鏈結法 | Hash Table — Separate Chaining | 插入／搜尋／刪除（平均） O(1 + α)；最差（全部碰撞） O(n)；空間 O(n + m) |
| ★ 雜湊表：開放定址 | Hash Table — Open Addressing | 插入／搜尋（平均） O(1 / (1 − α))；最差 O(n)；空間 O(m) |

### D3. 樹狀資料結構（9）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 二元樹 | Binary Tree | 走訪 O(n)；層序插入 O(n)；完全二元樹高度 ⌊log₂ n⌋ + 1 |
| ★ 二元搜尋樹 | Binary Search Tree | 搜尋／插入／刪除（平均） O(log n)；最差（退化成鏈） O(n)；中序走訪 O(n) |
| ★ AVL 樹 | AVL Tree | 搜尋／插入／刪除 O(log n)；旋轉 O(1)；高度上限 ≈ 1.44 log₂ n |
| ★ 紅黑樹 | Red-Black Tree | 搜尋／插入／刪除 O(log n)；插入旋轉次數 ≤ 2；刪除旋轉次數 ≤ 3；高度上限 2 log₂(n + 1) |
| 伸展樹 | Splay Tree | 操作（均攤） O(log n)；單次最差 O(n)；額外空間 O(1)（不需平衡欄位） |
| B 樹 | B-Tree | 搜尋／插入／刪除 O(log n)；磁碟 I/O O(log_t n)；每個節點的鍵數 t−1 ~ 2t−1 |
| B+ 樹 | B+ Tree | 搜尋／插入／刪除 O(log n)；範圍查詢 O(log n + 結果數)；每節點鍵數 ⌈M/2⌉−1 ~ M−1 |
| ★ 二元堆積 | Binary Heap (Priority Queue) | 取得最小值 O(1)；插入（上浮） O(log n)；取出堆頂（下沉） O(log n)；建堆 O(n) |
| ★ 字典樹（Trie） | Trie (Prefix Tree) | 插入／搜尋 O(L)；前綴查詢 O(L + 結果數)；空間 O(總字元數 · σ) |

### D4. 進階資料結構（5）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 線段樹 | Segment Tree (Lazy Propagation) | 建樹 O(n)；區間查詢 O(log n)；區間更新（懶標記） O(log n)；空間 O(4n) |
| 樹狀陣列 | Fenwick Tree (Binary Indexed Tree) | 前綴和查詢 O(log n)；單點更新 O(log n)；空間 O(n) |
| ★ 並查集 | Disjoint Set Union (Union-Find) | find / union（均攤） O(α(n))；空間 O(n) |
| ★ 圖 | Graph (Adjacency Matrix & List) | 查詢邊（矩陣／串列） O(1) / O(deg)；列舉鄰居（矩陣／串列） O(V) / O(deg)；空間（矩陣／串列） O(V²) / O(V + E) |
| 跳躍串列 | Skip List | 搜尋／插入／刪除（期望） O(log n)；最差 O(n)；空間（期望） O(n) |

### 1. 基礎搜尋（7）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 線性搜尋 | Linear Search | 時間 O(n)；空間 O(1) |
| ★ 二分搜尋 | Binary Search | 時間 O(log n)；空間 O(1) |
| 下界／上界搜尋 | Lower / Upper Bound | 時間 O(log n)；空間 O(1) |
| 跳躍搜尋 | Jump Search | 時間 O(√n)；空間 O(1) |
| 插值搜尋 | Interpolation Search | 時間 平均 O(log log n)，最差 O(n)；空間 O(1) |
| 指數搜尋 | Exponential Search | 時間 O(log i)；空間 O(1) |
| 三分搜尋 | Ternary Search | 時間 O(log n)；空間 O(1) |

### 2. 基礎排序（7）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 氣泡排序 | Bubble Sort | 時間 O(n²)，最佳 O(n)；空間 O(1) |
| ★ 選擇排序 | Selection Sort | 時間 O(n²)；空間 O(1) |
| ★ 插入排序 | Insertion Sort | 時間 O(n²)，最佳 O(n)；空間 O(1) |
| 希爾排序 | Shell Sort | 時間 約 O(n^1.3)，依 gap 序列而定；空間 O(1) |
| 雞尾酒排序 | Cocktail Shaker Sort | 時間 O(n²)；空間 O(1) |
| 梳排序 | Comb Sort | 時間 平均 O(n²/2^p)，最差 O(n²)；空間 O(1) |
| 侏儒排序 | Gnome Sort | 時間 O(n²)；空間 O(1) |

### 3. 高效比較排序（6）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 合併排序 | Merge Sort | 時間 O(n log n)；空間 O(n) |
| ★ 快速排序 | Quick Sort | 時間 平均 O(n log n)，最差 O(n²)；空間 O(log n) |
| ★ 堆積排序 | Heap Sort | 時間 O(n log n)；空間 O(1) |
| TimSort | TimSort | 時間 O(n log n)，最佳 O(n)；空間 O(n) |
| Introsort | Introsort | 時間 O(n log n)；空間 O(log n) |
| 樹排序 | Tree Sort | 時間 平均 O(n log n)，最差 O(n²)；空間 O(n) |

### 4. 非比較與特殊排序（6）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 計數排序 | Counting Sort | 時間 O(n + k)；空間 O(n + k) |
| ★ 基數排序 | Radix Sort (LSD) | 時間 O(d · (n + b))；空間 O(n + b) |
| 桶排序 | Bucket Sort | 時間 平均 O(n + k)，最差 O(n²)；空間 O(n + k) |
| 外部合併排序 | External Merge Sort | 時間 O(n log n)，磁碟 I/O 約 O((n/B) log_{M/B}(n/B))；空間 O(M) |
| 雙調排序 | Bitonic Sort | 時間 O(n log² n) 次比較，平行深度 O(log² n)；空間 O(1) |
| 奇偶換位排序 | Odd–Even Transposition Sort | 時間 O(n²) 次比較，平行 O(n) 步；空間 O(1) |

### 5. 選擇與陣列處理（10）

| 名稱 | English | 複雜度 |
|---|---|---|
| Quickselect | Quickselect | 時間 平均 O(n)，最差 O(n²)；空間 O(1) |
| Median of Medians | Median of Medians (BFPRT) | 時間 O(n)；空間 O(log n) |
| Top-K | Top-K with Min-Heap | 時間 O(n log k)；空間 O(k) |
| ★ 前綴和 | Prefix Sum | 時間 建構 O(n)，查詢 O(1)；空間 O(n) |
| 差分陣列 | Difference Array | 時間 每次更新 O(1)，還原 O(n)；空間 O(n) |
| Kadane 最大子陣列 | Kadane's Algorithm | 時間 O(n)；空間 O(1) |
| 荷蘭國旗分割 | Dutch National Flag (3-way Partition) | 時間 O(n)；空間 O(1) |
| Boyer–Moore 多數投票 | Boyer–Moore Majority Vote | 時間 O(n)；空間 O(1) |
| 原地合併 | In-place Merge | 時間 O(n²)（簡單旋轉版）；空間 O(1) |
| 陣列旋轉 | Array Rotation (Reversal) | 時間 O(n)；空間 O(1) |

### 6. 鏈結串列操作（8）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 插入與刪除 | Linked List Insert & Delete | 時間 定位 O(n)，改指標 O(1)；空間 O(1) |
| ★ 串列反轉 | Reverse Linked List | 時間 O(n)；空間 O(1) |
| 尋找中點 | Find Middle (Slow / Fast Pointers) | 時間 O(n)；空間 O(1) |
| 合併有序串列 | Merge Two Sorted Lists | 時間 O(n + m)；空間 O(1) |
| 刪除倒數第 k 個節點 | Remove k-th Node from End | 時間 O(n)；空間 O(1) |
| Floyd 環偵測 | Floyd's Cycle Detection (Tortoise & Hare) | 時間 O(n)；空間 O(1) |
| 尋找環入口 | Find Cycle Start | 時間 O(n)；空間 O(1) |
| 相交串列偵測 | Intersection of Two Lists | 時間 O(n + m)；空間 O(1) |

### 7. 堆疊與佇列應用（7）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 括號匹配 | Balanced Parentheses | 時間 O(n)；空間 O(n) |
| 中序轉後序表示式 | Infix to Postfix | 時間 O(n)；空間 O(n) |
| 後序表示式求值 | Postfix Evaluation | 時間 O(n)；空間 O(n) |
| Shunting Yard（直接求值） | Shunting Yard Evaluation | 時間 O(n)；空間 O(n) |
| 下一個較大元素 | Next Greater Element (Monotonic Stack) | 時間 O(n)；空間 O(n) |
| 直方圖最大矩形 | Largest Rectangle in Histogram | 時間 O(n)；空間 O(n) |
| 滑動視窗最大值 | Sliding Window Maximum (Monotonic Deque) | 時間 O(n)；空間 O(k) |

### 8. 樹操作與走訪（7）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 前序／中序／後序走訪 | Pre / In / Post-order Traversal | 時間 O(n)；空間 O(h) |
| ★ 層序走訪 | Level-order Traversal (BFS) | 時間 O(n)；空間 O(w)，w 為最大寬度 |
| Morris Traversal | Morris In-order Traversal | 時間 O(n)；空間 O(1) |
| 樹的直徑 | Tree Diameter (Two BFS) | 時間 O(n)；空間 O(n) |
| 最近共同祖先（LCA） | Lowest Common Ancestor (Binary Lifting) | 時間 預處理 O(n log n)，查詢 O(log n)；空間 O(n log n) |
| Euler Tour | Euler Tour of a Tree | 時間 O(n)；空間 O(n) |
| 樹鏈剖分（HLD） | Heavy-Light Decomposition | 時間 O(n) 預處理，路徑查詢 O(log² n)；空間 O(n) |

### 9. 圖走訪與結構分析（11）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 廣度優先搜尋（BFS） | Breadth-First Search | 時間 O(V + E)；空間 O(V) |
| ★ 深度優先搜尋（DFS） | Depth-First Search | 時間 O(V + E)；空間 O(V) |
| 連通分量 | Connected Components | 時間 O(V + E)；空間 O(V) |
| 環偵測 | Cycle Detection | 時間 O(V + E)；空間 O(V) |
| 二分圖判定 | Bipartite Check (2-coloring) | 時間 O(V + E)；空間 O(V) |
| ★ 拓撲排序（Kahn） | Topological Sort (Kahn's Algorithm) | 時間 O(V + E)；空間 O(V) |
| ★ 拓撲排序（DFS） | Topological Sort (DFS) | 時間 O(V + E)；空間 O(V) |
| Tarjan 強連通分量 | Tarjan's SCC | 時間 O(V + E)；空間 O(V) |
| Kosaraju 強連通分量 | Kosaraju's SCC | 時間 O(V + E)；空間 O(V) |
| 橋與割點 | Bridges & Articulation Points | 時間 O(V + E)；空間 O(V) |
| Hierholzer 歐拉路徑 | Hierholzer's Algorithm (Euler Path) | 時間 O(E)；空間 O(E) |

### 10. 最短路徑與路徑搜尋（10）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ Dijkstra | Dijkstra's Algorithm | 時間 O((V + E) log V)；空間 O(V) |
| ★ Bellman–Ford | Bellman–Ford Algorithm | 時間 O(V · E)；空間 O(V) |
| ★ Floyd–Warshall | Floyd–Warshall Algorithm | 時間 O(V³)；空間 O(V²) |
| DAG 最短路徑 | Shortest Path in DAG | 時間 O(V + E)；空間 O(V) |
| 0–1 BFS | 0–1 BFS | 時間 O(V + E)；空間 O(V) |
| Johnson | Johnson's Algorithm | 時間 O(V · E log V)；空間 O(V²) |
| 雙向 BFS | Bidirectional BFS | 時間 O(b^(d/2))；空間 O(b^(d/2)) |
| ★ A* 搜尋 | A* Search | 時間 最差 O(E log V)；空間 O(V) |
| IDA* | Iterative Deepening A* | 時間 最差指數級；空間 O(d) |
| 貪婪最佳優先搜尋 | Greedy Best-First Search | 時間 最差 O(E log V)；空間 O(V) |

### 11. 最小生成樹（3）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ Kruskal | Kruskal's Algorithm | 時間 O(E log E)；空間 O(V) |
| ★ Prim | Prim's Algorithm | 時間 O(E log V)；空間 O(V) |
| Borůvka | Borůvka's Algorithm | 時間 O(E log V)；空間 O(V) |

### 12. 網路流與匹配（9）

| 名稱 | English | 複雜度 |
|---|---|---|
| Ford–Fulkerson | Ford–Fulkerson (DFS) | 時間 O(E · maxFlow)；空間 O(V + E) |
| Edmonds–Karp | Edmonds–Karp (BFS) | 時間 O(V · E²)；空間 O(V + E) |
| Dinic | Dinic's Algorithm | 時間 O(V² · E)，單位容量 O(E√V)；空間 O(V + E) |
| Push–Relabel | Push–Relabel (FIFO) | 時間 O(V³)；空間 O(V + E) |
| 最小費用最大流 | Min-Cost Max-Flow (SPFA) | 時間 O(F · V · E)；空間 O(V + E) |
| 二分圖增廣路匹配 | Bipartite Matching (Kuhn's Augmenting Path) | 時間 O(V · E)；空間 O(V) |
| Hopcroft–Karp | Hopcroft–Karp | 時間 O(E √V)；空間 O(V) |
| 匈牙利演算法 | Hungarian Algorithm (Kuhn–Munkres) | 時間 O(n³)；空間 O(n²) |
| Gale–Shapley 穩定匹配 | Gale–Shapley Stable Matching | 時間 O(n²)；空間 O(n²) |

### 13. 貪婪演算法（6）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 活動選擇／區間排程 | Activity Selection / Interval Scheduling | 時間 O(n log n)；空間 O(1) |
| 區間分組 | Interval Partitioning | 時間 O(n log n)；空間 O(n) |
| 分數背包 | Fractional Knapsack | 時間 O(n log n)；空間 O(n) |
| Huffman 編碼 | Huffman Coding | 時間 O(n log n)；空間 O(n) |
| 工作排程 | Job Sequencing with Deadlines | 時間 O(n²)（可用並查集優化至 O(n log n)）；空間 O(n) |
| 最優合併模式 | Optimal Merge Pattern | 時間 O(n log n)；空間 O(n) |

### 14. 動態規劃（17）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ Fibonacci | Fibonacci (Naive / Memo / Tabulation) | 時間 遞迴 O(φⁿ)，DP O(n)；空間 O(n) |
| ★ 爬樓梯 | Climbing Stairs | 時間 O(n · |steps|)；空間 O(n) |
| ★ 0/1 背包 | 0/1 Knapsack | 時間 O(n · W)；空間 O(n · W) |
| 完全背包 | Unbounded Knapsack | 時間 O(n · W)；空間 O(W) |
| 多重背包 | Bounded Knapsack (Binary Splitting) | 時間 O(W · Σ log c)；空間 O(W) |
| 零錢兌換 | Coin Change | 時間 O(A · |coins|)；空間 O(A) |
| 子集合和 | Subset Sum | 時間 O(n · T)；空間 O(n · T) |
| 最長共同子序列（LCS） | Longest Common Subsequence | 時間 O(n · m)；空間 O(n · m) |
| 最長遞增子序列（LIS） | Longest Increasing Subsequence | 時間 O(n²) 或 O(n log n)；空間 O(n) |
| 編輯距離 | Edit Distance (Levenshtein) | 時間 O(n · m)；空間 O(n · m) |
| 矩陣鏈乘法 | Matrix Chain Multiplication | 時間 O(n³)；空間 O(n²) |
| 網格路徑 | Grid Paths (Count / Min Path Sum) | 時間 O(R · C)；空間 O(R · C) |
| 區間 DP（石子合併） | Interval DP (Stone Merging) | 時間 O(n³)；空間 O(n²) |
| 樹形 DP（最大獨立集） | Tree DP (Max Weight Independent Set) | 時間 O(n)；空間 O(h) |
| 狀態壓縮 DP（指派問題） | Bitmask DP (Assignment Problem) | 時間 O(2ⁿ · n)；空間 O(2ⁿ) |
| 數位 DP | Digit DP | 時間 O(位數 · S · 10)；空間 O(位數 · S) |
| 旅行推銷員 Held–Karp | TSP — Held–Karp | 時間 O(2ⁿ · n²)；空間 O(2ⁿ · n) |

### 15. 回溯與組合搜尋（12）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 排列 | Permutations | 時間 O(n · n!)；空間 O(n) |
| ★ 組合 | Combinations C(n, k) | 時間 O(k · C(n,k))；空間 O(k) |
| ★ 子集合 | Subsets (Power Set) | 時間 O(n · 2ⁿ)；空間 O(n) |
| ★ N 皇后 | N-Queens | 時間 O(N!)；空間 O(N) |
| 數獨求解 | Sudoku Solver | 時間 最差指數級；空間 O(81) |
| 迷宮搜尋 | Maze Solving (DFS Backtracking) | 時間 O(R · C)；空間 O(R · C) |
| 迷宮生成 | Maze Generation (Recursive Backtracker) | 時間 O(R · C)；空間 O(R · C) |
| 圖著色 | Graph m-Coloring | 時間 O(mⁿ)；空間 O(n) |
| 騎士巡遊 | Knight's Tour (Warnsdorff + Backtracking) | 時間 最差指數級；空間 O(N²) |
| Hamilton 路徑 | Hamiltonian Path (Backtracking) | 時間 O(V!)；空間 O(V) |
| 精確覆蓋 Algorithm X | Exact Cover — Knuth Algorithm X (Dancing Links) | 時間 最差指數級；空間 O(1 的個數) |
| 分支限界法 | Branch and Bound (0/1 Knapsack) | 時間 最差 O(2ⁿ)；空間 O(2ⁿ) |

### 16. 字串演算法（11）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 暴力字串匹配 | Naive String Matching | 時間 O(n · m)；空間 O(1) |
| ★ KMP | Knuth–Morris–Pratt | 時間 O(n + m)；空間 O(m) |
| Rabin–Karp | Rabin–Karp | 時間 平均 O(n + m)，最差 O(n · m)；空間 O(1) |
| Boyer–Moore | Boyer–Moore (Bad Character + Good Suffix) | 時間 最佳 O(n/m)，最差 O(n · m)；空間 O(m + σ) |
| Horspool | Boyer–Moore–Horspool | 時間 平均 O(n)，最差 O(n · m)；空間 O(σ) |
| Z Algorithm | Z Algorithm | 時間 O(n)；空間 O(n) |
| Aho–Corasick | Aho–Corasick | 時間 O(n + Σ|P| + 出現次數)；空間 O(Σ|P| · σ) |
| Manacher | Manacher's Algorithm | 時間 O(n)；空間 O(n) |
| 滾動雜湊 | Rolling Hash (Polynomial Prefix Hash) | 時間 預處理 O(n)，查詢 O(1)；空間 O(n) |
| 後綴陣列建構 | Suffix Array (Prefix Doubling) | 時間 O(n log² n)（基數排序可到 O(n log n)）；空間 O(n) |
| Kasai LCP | Kasai's LCP Array | 時間 O(n)；空間 O(n) |

### 17. 數學與數論（14）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 歐幾里得最大公因數 | Euclidean GCD | 時間 O(log min(a, b))；空間 O(1) |
| 擴展歐幾里得 | Extended Euclidean Algorithm | 時間 O(log min(a, b))；空間 O(1) |
| 最小公倍數 | Least Common Multiple | 時間 O(k log M)；空間 O(1) |
| ★ 質數篩（埃拉托斯特尼） | Sieve of Eratosthenes | 時間 O(N log log N)；空間 O(N) |
| 線性篩 | Linear Sieve (Euler) | 時間 O(N)；空間 O(N) |
| 分段篩 | Segmented Sieve | 時間 O((R − L + 1) log log R + √R)；空間 O(√R + R − L) |
| 質因數分解 | Prime Factorization (Trial Division) | 時間 O(√n)；空間 O(log n) |
| ★ 快速冪 | Binary Exponentiation | 時間 O(log n)；空間 O(1) |
| 模冪 | Modular Exponentiation (Left-to-Right) | 時間 O(log n)；空間 O(1) |
| 模反元素 | Modular Inverse | 時間 O(log m)；空間 O(1) |
| 中國剩餘定理 | Chinese Remainder Theorem | 時間 O(k log M)；空間 O(1) |
| Miller–Rabin | Miller–Rabin Primality Test | 時間 O(k log³ n)；空間 O(1) |
| 矩陣快速冪 | Matrix Exponentiation (Fibonacci) | 時間 O(k³ log n)；空間 O(k²) |
| FFT 多項式乘法 | Fast Fourier Transform (Polynomial Multiplication) | 時間 O(n log n)；空間 O(n) |

### 18. 計算幾何（12）

| 名稱 | English | 複雜度 |
|---|---|---|
| 向量叉積與方向判斷 | Cross Product & Orientation | 時間 O(1)；空間 O(1) |
| 線段相交 | Segment Intersection Test | 時間 O(1)；空間 O(1) |
| 點在多邊形內判定 | Point in Polygon (Ray Casting) | 時間 O(n)；空間 O(1) |
| ★ 凸包：Graham Scan | Convex Hull — Graham Scan | 時間 O(n log n)；空間 O(n) |
| ★ 凸包：Monotone Chain | Convex Hull — Andrew Monotone Chain | 時間 O(n log n)；空間 O(n) |
| ★ 凸包：Jarvis March | Convex Hull — Gift Wrapping | 時間 O(n · h)；空間 O(h) |
| 最近點對 | Closest Pair of Points (Divide & Conquer) | 時間 O(n log n)；空間 O(n) |
| 掃描線（矩形聯集面積） | Sweep Line — Area of Union of Rectangles | 時間 O(n² log n)（線段樹可到 O(n log n)）；空間 O(n) |
| 旋轉卡尺 | Rotating Calipers (Diameter) | 時間 O(n log n)（凸包）+ O(h)；空間 O(h) |
| 多邊形裁切 | Polygon Clipping (Sutherland–Hodgman) | 時間 O(n · m)；空間 O(n + m) |
| Voronoi 圖 | Voronoi Diagram (Half-plane Intersection) | 時間 O(n² · n)（教學版）；空間 O(n²) |
| Delaunay 三角剖分 | Delaunay Triangulation (Bowyer–Watson) | 時間 平均 O(n log n)，最差 O(n²)；空間 O(n) |

### 19. 隨機化與資料抽樣（5）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ Fisher–Yates 洗牌 | Fisher–Yates Shuffle | 時間 O(n)；空間 O(1) |
| 蓄水池抽樣 | Reservoir Sampling (Algorithm R) | 時間 O(n)；空間 O(k) |
| 隨機化 Quickselect | Randomized Quickselect | 時間 期望 O(n)；空間 O(1) |
| 蒙地卡羅估算 | Monte Carlo Estimation of π | 時間 O(n)；空間 O(1) |
| 隨機漫步 | Random Walk | 時間 O(n)；空間 O(n) |

### 20. 其他應用領域（16）

| 名稱 | English | 複雜度 |
|---|---|---|
| 游程編碼（RLE） | Run-Length Encoding | 時間 O(n)；空間 O(n) |
| LZ77 | LZ77 (Sliding Window) | 時間 O(n · W)；空間 O(W) |
| LZ78 | LZ78 (Dictionary) | 時間 O(n)；空間 O(n) |
| LZW | Lempel–Ziv–Welch | 時間 O(n)；空間 O(n) |
| 算術編碼 | Arithmetic Coding | 時間 O(n)；空間 O(σ) |
| Minimax | Minimax | 時間 O(b^d)；空間 O(d) |
| Alpha–Beta 剪枝 | Alpha–Beta Pruning | 時間 最佳 O(b^(d/2))；空間 O(d) |
| Monte Carlo Tree Search | Monte Carlo Tree Search (UCT) | 時間 O(迭代數 × 深度)；空間 O(樹的大小) |
| 梯度下降 | Gradient Descent | 時間 每步 O(1)；空間 O(1) |
| 牛頓法 | Newton's Method | 時間 每步 O(1)，二次收斂；空間 O(1) |
| 二分求根 | Bisection Method | 時間 O(log((b−a)/ε))；空間 O(1) |
| 高斯消去法 | Gaussian Elimination (Partial Pivoting) | 時間 O(n³)；空間 O(n²) |
| K-Means 分群 | K-Means Clustering (Lloyd) | 時間 O(n · k · 迭代數)；空間 O(n + k) |
| k-NN 分類 | k-Nearest Neighbors | 時間 每次查詢 O(n log n)；空間 O(n) |
| PageRank | PageRank (Power Iteration) | 時間 O(迭代數 · (V + E))；空間 O(V) |
| 河內塔 | Tower of Hanoi | 時間 O(2ⁿ)；空間 O(n) |
