# 演算法與資料結構清單

## 附錄檢核結果

附錄 20 類中的項目已**全部整合**進程式，並保留原本清單中附錄沒有的項目（河內塔、迷宮生成、遞迴樹等）。整合時的處理方式如下：

### 合併或調整的項目

| 附錄項目 | 處理方式 |
|---|---|
| 活動選擇、區間排程 | 兩者是同一個貪婪問題（選出最多不重疊區間），合併為「活動選擇／區間排程」 |
| 中序轉後序、Shunting Yard | 拆成兩項：「中序轉後序」示範基本轉換；「Shunting Yard（直接求值）」為完整版，支援函式、逗號參數、一元負號，並以雙堆疊直接算出結果 |
| 快速冪、模冪 | 拆成兩種變體：快速冪為由低位到高位（大整數）；模冪為由高位到低位的平方乘法（取模） |
| FFT／NTT | FFT 多項式乘法（位元反轉 + 蝴蝶運算）；擴充目錄加入後，NTT 另成一項（可選模數 17、97、998244353，並檢查長度條件） |
| 滾動雜湊 | 與 Rabin–Karp 分開：示範前綴雜湊 O(1) 取子字串雜湊，用來找重複子字串 |
| 樹操作：BST 搜尋／插入／刪除、AVL 旋轉、紅黑樹修復、堆積建構／上浮／下沉 | 放在資料結構分類 D3，以互動操作逐步呈現（可自行輸入值插入、刪除），不重複做成演算法頁 |
| 鏈結串列插入與刪除 | 同時有演算法頁（指標改接順序）與資料結構頁（D1 互動操作） |
| 跳躍串列的隨機層級建構 | 實作為資料結構 D4「跳躍串列」 |
| 區間 DP／樹形 DP／狀態壓縮 DP／數位 DP | 各選一個經典題：石子合併、樹上最大權獨立集、指派問題、數字和計數（附暴力驗證） |
| 掃描線 | 以「矩形聯集面積」示範掃描線技巧；Bentley–Ottmann 線段交點於擴充目錄另成一項 |
| Voronoi Diagram | 以「垂直平分線半平面裁切」建構；Fortune 掃描線演算法於擴充目錄另成一項，並與裁切版對照頂點 |
| 精確覆蓋 Algorithm X／Dancing Links | 以關聯矩陣呈現 cover／uncover 的刪除與還原過程 |
| 蒙地卡羅估算 | 以估算 π 為例，並畫出收斂曲線 |
| Monte Carlo Tree Search | 以井字棋盤面為例（UCT） |
| Minimax、Alpha–Beta | 使用同一棵可自訂葉節點分數的博弈樹，方便比較剪枝效果 |

### 原清單額外保留的項目

河內塔、迷宮生成（遞迴回溯）、Fibonacci 遞迴樹（與記憶化比較）、以及 D1～D4 共 25 種資料結構。

## 擴充目錄整合結果

擴充目錄的 162 個提案（155 個候選項目 + 7 個橋接概念）已**全部整合**，每項都有逐步動畫、虛擬碼行同步、複雜度、邊界與失敗案例，以及五種語言的實作；學習路徑與先備知識樹也一併擴充為 19 個階段。

- 新增分類：0 基礎概念、D5 機率與快取結構、5.1 陣列解題技巧、17.1 線性代數與數值方法、21 密碼學、22 影像處理、23 機器學習與隨機最佳化；原有的二分求根、牛頓法、高斯消去法移到 17.1，梯度下降、K 平均、K 近鄰移到 23。
- 影像處理使用新的像素面板，以固定的 16×16 測試影像呈現（含固定種子的雜訊版本）。
- 目錄中「驗收條件」要求明訂的政策，在各頁直接寫出，例如：Bentley–Ottmann 不接受垂直與重疊共線線段、同點多線只回報一次；DBSCAN 的 minPts 含自己；決策樹分數平手取特徵與門檻較小者；分水嶺同高度先進先出；距離轉換明示為 L1／L∞；大津法對單一灰階的處理；直方圖均衡化對常數影像原樣輸出；半平面交自動加入大方框；別名法拒絕負權重與總和為 0。
- 啟發式方法（模擬退火、遺傳演算法）不宣稱最優，分別以暴力法與動態規劃的最佳值比較差距。
- 密碼學頁面為教學示範：RSA 為不含填充的教科書 RSA、簽章使用 512 位元示範金鑰、區塊模式的 IV／nonce 為固定值，各頁說明中都寫出實務上需要的條件（OAEP、2048 位元以上、nonce 不可重複、Diffie–Hellman 需搭配身分驗證等）。

## 驗證方式

- `npm test`：對每個項目以預設輸入與 6 組隨機輸入執行，檢查無例外、虛擬碼行號有效；排序類檢查結果已排序；並對 AVL、紅黑樹、伸展樹、B／B+ 樹、跳躍串列、雜湊表、線段樹、樹狀陣列、堆積做隨機操作，與參考集合比對並檢查結構不變量。
- 另外以暴力法交叉驗證：最大流（四種演算法結果一致）、字串匹配（五種演算法）、凸包（三種）、最近點對、數位 DP、TSP。
- 擴充項目的頁內驗證：AES 與 SHA-256、HMAC 對照標準測試向量；Bentley–Ottmann 與 O(n²) 暴力比對；Fortune 與裁切版 Voronoi、外接圓空心檢查；快速凸包與單調鏈；耳切法與鞋帶公式面積；半平面交與逐一裁切；鞋帶公式以 Pick 定理檢查；梯度檢查以中央差分比對反向傳播；LU、QR 以 PA = LU、QᵀQ = I 驗證；距離轉換、連通元件與暴力法或 BFS 比對。

## 完整清單（由程式自動產生）

共 **46** 種資料結構、**325** 種演算法，合計 **371** 項。★ 為附錄標記的重點項目。

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

### D2. 雜湊表（4）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 雜湊表：鏈結法 | Hash Table — Separate Chaining | 插入／搜尋／刪除（平均） O(1 + α)；最差（全部碰撞） O(n)；空間 O(n + m) |
| ★ 雜湊表：開放定址 | Hash Table — Open Addressing | 插入／搜尋（平均） O(1 / (1 − α))；最差 O(n)；空間 O(m) |
| 布穀鳥雜湊 | Cuckoo Hashing | 查詢／刪除 最壞 O(1)；插入 期望 O(1)（均攤）；負載率 約 < 50% |
| 羅賓漢雜湊 | Robin Hood Hashing | 查詢／插入／刪除 期望 O(1)；最大探測距離 期望 O(log n) |

### D3. 樹狀資料結構（13）

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
| ★ 字典樹 | Trie (Prefix Tree) | 插入／搜尋 O(L)；前綴查詢 O(L + 結果數)；空間 O(總字元數 · σ) |
| 樹堆 | Treap | 插入／刪除／查詢 期望 O(log n)；空間 O(n) |
| 順序統計樹 | Order Statistic Tree | 插入／刪除 O(log n)；select / rank O(log n)；空間 O(n) |
| 二進位字典樹 | Binary Trie | 插入／刪除 O(W)；最大 XOR 查詢 O(W)；空間 O(n·W) |
| 壓縮字典樹 | Radix Tree (Compressed Trie) | 插入／查詢 O(L)（L 為字串長度）；節點數 ≤ 2n |

### D4. 進階資料結構（14）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 線段樹 | Segment Tree (Lazy Propagation) | 建樹 O(n)；區間查詢 O(log n)；區間更新（懶標記） O(log n)；空間 O(4n) |
| 樹狀陣列 | Fenwick Tree (Binary Indexed Tree) | 前綴和查詢 O(log n)；單點更新 O(log n)；空間 O(n) |
| ★ 並查集 | Disjoint Set Union (Union-Find) | find / union（均攤） O(α(n))；空間 O(n) |
| ★ 圖 | Graph (Adjacency Matrix & List) | 查詢邊（矩陣／串列） O(1) / O(deg)；列舉鄰居（矩陣／串列） O(V) / O(deg)；空間（矩陣／串列） O(V²) / O(V + E) |
| 跳躍串列 | Skip List | 搜尋／插入／刪除（期望） O(log n)；最差 O(n)；空間（期望） O(n) |
| 稀疏表 | Sparse Table | 預處理 O(n log n)；查詢（冪等運算） O(1)；空間 O(n log n) |
| 平方根分塊 | Square Root Decomposition | 區間查詢 O(√n)；單點更新 O(1)；空間 O(√n) 額外 |
| 持久化線段樹 | Persistent Segment Tree | 單點更新（建立新版本） O(log n) 時間與空間；任一版本的區間查詢 O(log n)；總空間 O(n + q log n) |
| 可回滾並查集 | Rollback DSU | find O(log n)；union O(log n)；撤回一次修改 O(1) |
| 帶權並查集 | Weighted DSU | find / relate / diff（均攤） O(α(n))；空間 O(n) |
| k 維樹 | k-d Tree | 建樹 O(n log n)；最近鄰查詢 平均 O(log n)，最壞 O(n)；插入（不重新平衡） O(深度) |
| 四元樹 | Quadtree | 插入 O(深度)；範圍查詢 與相交格子數 + 結果數成正比；最大深度 本頁限制為 5 |
| 二維樹狀陣列 | 2D Fenwick Tree | 單點更新 O(log n · log m)；矩形和查詢 O(log n · log m)；空間 O(nm) |
| 資料流中位數 | Streaming Median | 加入一筆 O(log n)；查詢中位數 O(1)；空間 O(n) |

### D5. 機率與快取結構（6）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 布隆過濾器 | Bloom Filter | 插入／查詢 O(k)；空間 m 位元；誤判率 ≈ (1 − e^(−kn/m))^k |
| 計數布隆過濾器 | Counting Bloom Filter | 插入／查詢／刪除 O(k)；空間 m 個計數器 |
| Count–Min 頻率估計 | Count–Min Sketch | 更新／查詢 O(d)；空間 O(d·w)；誤差 ≤ εN（機率 1 − δ，w = e/ε，d = ln(1/δ)） |
| HyperLogLog 基數估計 | HyperLogLog | 加入 O(1)；估計 O(m)；空間 m 個 5～6 位元暫存器 |
| ★ 最近最少使用快取 | LRU Cache | get / put O(1)；空間 O(容量) |
| 最不常使用快取 | LFU Cache | get / put O(1)；空間 O(容量) |

### 0. 基礎概念（7）

| 名稱 | English | 複雜度 |
|---|---|---|
| 模運算基礎 | Modular Arithmetic | 時間 每次運算 O(1)；空間 O(1) |
| 位元運算基礎 | Bitwise Operations | 時間 每個運算 O(1)（硬體一次處理 w 位）；空間 O(1) |
| 機率與期望基礎 | Probability Basics | 時間 O(1)；空間 O(1) |
| 矩陣與線性變換 | Matrix Basics | 時間 乘法 O(n·m·p)，行列式（餘因子展開）O(n!)；空間 O(n·p) |
| 導數與梯度基礎 | Derivatives and Gradients | 時間 每個差分 O(1)；空間 O(1) |
| 有限體運算 | Finite Field Arithmetic GF(2⁸) | 時間 乘法 O(8)，求反元素 O(8·log 255)；空間 O(1) |
| 特徵值與特徵向量 | Eigenvalues and Eigenvectors | 時間 2×2 解析解 O(1)；空間 O(1) |

### 1. 基礎搜尋（10）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 線性搜尋 | Linear Search | 時間 O(n)；空間 O(1) |
| ★ 二分搜尋 | Binary Search | 時間 O(log n)；空間 O(1) |
| 下界／上界搜尋 | Lower / Upper Bound | 時間 O(log n)；空間 O(1) |
| 跳躍搜尋 | Jump Search | 時間 O(√n)；空間 O(1) |
| 插值搜尋 | Interpolation Search | 時間 平均 O(log log n)，最差 O(n)；空間 O(1) |
| 指數搜尋 | Exponential Search | 時間 O(log i)；空間 O(1) |
| 三分搜尋 | Ternary Search | 時間 O(log n)；空間 O(1) |
| 答案二分搜尋 | Binary Search on Answer | 時間 O(n log max(p))；空間 O(1) |
| 旋轉有序陣列搜尋 | Search in Rotated Sorted Array | 時間 O(log n)；有重複值時最壞 O(n)；空間 O(1) |
| 兩個有序陣列的中位數 | Median of Two Sorted Arrays | 時間 O(log min(m, n))；空間 O(1) |

### 2. 基礎排序（11）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 氣泡排序 | Bubble Sort | 時間 O(n²)，最佳 O(n)；空間 O(1) |
| ★ 選擇排序 | Selection Sort | 時間 O(n²)；空間 O(1) |
| ★ 插入排序 | Insertion Sort | 時間 O(n²)，最佳 O(n)；空間 O(1) |
| 希爾排序 | Shell Sort | 時間 約 O(n^1.3)，依 gap 序列而定；空間 O(1) |
| 雞尾酒排序 | Cocktail Shaker Sort | 時間 O(n²)；空間 O(1) |
| 梳排序 | Comb Sort | 時間 平均 O(n²/2^p)，最差 O(n²)；空間 O(1) |
| 侏儒排序 | Gnome Sort | 時間 O(n²)；空間 O(1) |
| 循環排序 | Cycle Sort | 時間 O(n²)；空間 O(1) |
| 遞迴泡沫排序 | Recursive Bubble Sort | 時間 O(n²)，已排序時 O(n)；空間 O(n) 遞迴堆疊 |
| 二分插入排序 | Binary Insertion Sort | 時間 比較 O(n log n)，搬移 O(n²)；空間 O(1) |
| 煎餅排序 | Pancake Sort | 時間 O(n²)；空間 O(1) |

### 3. 高效比較排序（7）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 合併排序 | Merge Sort | 時間 O(n log n)；空間 O(n) |
| ★ 快速排序 | Quick Sort | 時間 平均 O(n log n)，最差 O(n²)；空間 O(log n) |
| ★ 堆積排序 | Heap Sort | 時間 O(n log n)；空間 O(1) |
| 提姆排序 | TimSort | 時間 O(n log n)，最佳 O(n)；空間 O(n) |
| 內省排序 | Introsort | 時間 O(n log n)；空間 O(log n) |
| 樹排序 | Tree Sort | 時間 平均 O(n log n)，最差 O(n²)；空間 O(n) |
| 耐心排序 | Patience Sorting | 時間 O(n log n)；空間 O(n) |

### 4. 非比較與特殊排序（8）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 計數排序 | Counting Sort | 時間 O(n + k)；空間 O(n + k) |
| ★ 基數排序 | Radix Sort (LSD) | 時間 O(d · (n + b))；空間 O(n + b) |
| 桶排序 | Bucket Sort | 時間 平均 O(n + k)，最差 O(n²)；空間 O(n + k) |
| 外部合併排序 | External Merge Sort | 時間 O(n log n)，磁碟 I/O 約 O((n/B) log_{M/B}(n/B))；空間 O(M) |
| 雙調排序 | Bitonic Sort | 時間 O(n log² n) 次比較，平行深度 O(log² n)；空間 O(1) |
| 奇偶換位排序 | Odd–Even Transposition Sort | 時間 O(n²) 次比較，平行 O(n) 步；空間 O(1) |
| 最高位優先基數排序 | MSD Radix Sort | 時間 O(N + n·σ)（N 為總字元數，σ 為字母表大小）；空間 O(n + σ) |
| 多路合併 | K-way Merge | 時間 O(N log k)；空間 O(k) |

### 5. 選擇與陣列處理（12）

| 名稱 | English | 複雜度 |
|---|---|---|
| 快速選擇 | Quickselect | 時間 平均 O(n)，最差 O(n²)；空間 O(1) |
| 中位數的中位數 | Median of Medians (BFPRT) | 時間 O(n)；空間 O(log n) |
| 前 K 大元素 | Top-K with Min-Heap | 時間 O(n log k)；空間 O(k) |
| ★ 前綴和 | Prefix Sum | 時間 建構 O(n)，查詢 O(1)；空間 O(n) |
| 差分陣列 | Difference Array | 時間 每次更新 O(1)，還原 O(n)；空間 O(n) |
| 最大子陣列和 | Kadane's Algorithm | 時間 O(n)；空間 O(1) |
| 荷蘭國旗分割 | Dutch National Flag (3-way Partition) | 時間 O(n)；空間 O(1) |
| 多數投票法 | Boyer–Moore Majority Vote | 時間 O(n)；空間 O(1) |
| 原地合併 | In-place Merge | 時間 O(n²)（簡單旋轉版）；空間 O(1) |
| 陣列旋轉 | Array Rotation (Reversal) | 時間 O(n)；空間 O(1) |
| 逆序對計數 | Inversion Count | 時間 O(n log n)；空間 O(n) |
| 尋找第二大元素 | Find Second Largest Element | 時間 O(n)；空間 O(1) |

### 5.1. 陣列解題技巧（11）

| 名稱 | English | 複雜度 |
|---|---|---|
| 雙指標技巧 | Two Pointers | 時間 O(n)（已排序）；空間 O(1) |
| 滑動視窗技巧 | Sliding Window | 時間 O(n)；空間 O(1) |
| 二維前綴和 | 2D Prefix Sum | 時間 建表 O(RC)，查詢 O(1)；空間 O(RC) |
| 二維差分 | 2D Difference Array | 時間 每次更新 O(1)，還原 O(RC)；空間 O(RC) |
| 座標壓縮 | Coordinate Compression | 時間 O(n log n)；空間 O(n) |
| 區間合併 | Merge Intervals | 時間 O(n log n)；空間 O(n) |
| 和為 K 的子陣列計數 | Subarray Sum Equals K | 時間 O(n) 期望；空間 O(n) |
| 接雨水 | Trapping Rain Water | 時間 O(n)；空間 O(1) |
| 下一個字典序排列 | Next Permutation | 時間 O(n)；空間 O(1) |
| 折半搜尋 | Meet in the Middle | 時間 O(2^(n/2) · n)；空間 O(2^(n/2)) |
| 莫隊演算法 | Mo's Algorithm | 時間 O((n + q)·√n)；空間 O(n + q) |

### 6. 鏈結串列操作（8）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 插入與刪除 | Linked List Insert & Delete | 時間 定位 O(n)，改指標 O(1)；空間 O(1) |
| ★ 串列反轉 | Reverse Linked List | 時間 O(n)；空間 O(1) |
| 尋找中點 | Find Middle (Slow / Fast Pointers) | 時間 O(n)；空間 O(1) |
| 合併有序串列 | Merge Two Sorted Lists | 時間 O(n + m)；空間 O(1) |
| 刪除倒數第 k 個節點 | Remove k-th Node from End | 時間 O(n)；空間 O(1) |
| 龜兔賽跑環偵測 | Floyd's Cycle Detection (Tortoise & Hare) | 時間 O(n)；空間 O(1) |
| 尋找環入口 | Find Cycle Start | 時間 O(n)；空間 O(1) |
| 相交串列偵測 | Intersection of Two Lists | 時間 O(n + m)；空間 O(1) |

### 7. 堆疊與佇列應用（7）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 括號匹配 | Balanced Parentheses | 時間 O(n)；空間 O(n) |
| 中序轉後序表示式 | Infix to Postfix | 時間 O(n)；空間 O(n) |
| 後序表示式求值 | Postfix Evaluation | 時間 O(n)；空間 O(n) |
| 調度場演算法（直接求值） | Shunting Yard Evaluation | 時間 O(n)；空間 O(n) |
| 下一個較大元素 | Next Greater Element (Monotonic Stack) | 時間 O(n)；空間 O(n) |
| 直方圖最大矩形 | Largest Rectangle in Histogram | 時間 O(n)；空間 O(n) |
| 滑動視窗最大值 | Sliding Window Maximum (Monotonic Deque) | 時間 O(n)；空間 O(k) |

### 8. 樹操作與走訪（10）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 前序／中序／後序走訪 | Pre / In / Post-order Traversal | 時間 O(n)；空間 O(h) |
| ★ 層序走訪 | Level-order Traversal (BFS) | 時間 O(n)；空間 O(w)，w 為最大寬度 |
| 莫里斯中序走訪 | Morris In-order Traversal | 時間 O(n)；空間 O(1) |
| 樹的直徑 | Tree Diameter (Two BFS) | 時間 O(n)；空間 O(n) |
| 最近共同祖先 | Lowest Common Ancestor (Binary Lifting) | 時間 預處理 O(n log n)，查詢 O(log n)；空間 O(n log n) |
| 歐拉序走訪 | Euler Tour of a Tree | 時間 O(n)；空間 O(n) |
| 樹鏈剖分 | Heavy-Light Decomposition | 時間 O(n) 預處理，路徑查詢 O(log² n)；空間 O(n) |
| Tarjan 離線最近共同祖先 | Tarjan Offline LCA | 時間 O((n + q)·α(n))；空間 O(n + q) |
| 換根動態規劃 | Rerooting DP | 時間 O(n)；空間 O(n) |
| 重心分解 | Centroid Decomposition | 時間 O(n log n)；空間 O(n) |

### 9. 圖走訪與結構分析（16）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 廣度優先搜尋 | Breadth-First Search | 時間 O(V + E)；空間 O(V) |
| ★ 深度優先搜尋 | Depth-First Search | 時間 O(V + E)；空間 O(V) |
| 連通分量 | Connected Components | 時間 O(V + E)；空間 O(V) |
| 環偵測 | Cycle Detection | 時間 O(V + E)；空間 O(V) |
| 二分圖判定 | Bipartite Check (2-coloring) | 時間 O(V + E)；空間 O(V) |
| ★ 拓撲排序（入度法） | Topological Sort (Kahn's Algorithm) | 時間 O(V + E)；空間 O(V) |
| ★ 拓撲排序（深度優先） | Topological Sort (DFS) | 時間 O(V + E)；空間 O(V) |
| 強連通分量（塔揚） | Tarjan's SCC | 時間 O(V + E)；空間 O(V) |
| 強連通分量（科薩拉朱） | Kosaraju's SCC | 時間 O(V + E)；空間 O(V) |
| 橋與割點 | Bridges & Articulation Points | 時間 O(V + E)；空間 O(V) |
| 歐拉路徑（希爾霍爾澤） | Hierholzer's Algorithm (Euler Path) | 時間 O(E)；空間 O(E) |
| 多源廣度優先搜尋 | Multi-source BFS | 時間 O(V + E)（格子為 O(R·C)）；空間 O(V) |
| 迭代加深深度優先搜尋 | Iterative Deepening DFS | 時間 O(b^d)（b 分支度、d 解的深度）；空間 O(d) |
| Warshall 遞移閉包 | Warshall Transitive Closure | 時間 O(V³)；空間 O(V²) |
| 二元可滿足性 | 2-SAT | 時間 O(n + m)；空間 O(n + m) |
| 離線動態連通性 | Offline Dynamic Connectivity | 時間 O(T log T · log n)；空間 O(T log T) |

### 10. 最短路徑與路徑搜尋（13）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 戴克斯特拉演算法 | Dijkstra's Algorithm | 時間 O((V + E) log V)；空間 O(V) |
| ★ 貝爾曼–福特演算法 | Bellman–Ford Algorithm | 時間 O(V · E)；空間 O(V) |
| ★ 弗洛伊德–沃舍爾演算法 | Floyd–Warshall Algorithm | 時間 O(V³)；空間 O(V²) |
| 有向無環圖最短路徑 | Shortest Path in DAG | 時間 O(V + E)；空間 O(V) |
| 零一權重最短路徑 | 0–1 BFS | 時間 O(V + E)；空間 O(V) |
| 強森演算法 | Johnson's Algorithm | 時間 O(V · E log V)；空間 O(V²) |
| 雙向廣度優先搜尋 | Bidirectional BFS | 時間 O(b^(d/2))；空間 O(b^(d/2)) |
| ★ A* 搜尋 | A* Search | 時間 最差 O(E log V)；空間 O(V) |
| 迭代加深 A* 搜尋 | Iterative Deepening A* | 時間 最差指數級；空間 O(d) |
| 貪婪最佳優先搜尋 | Greedy Best-First Search | 時間 最差 O(E log V)；空間 O(V) |
| DAG 最長路徑 | Longest Path in DAG | 時間 O(V + E)；空間 O(V) |
| 關鍵路徑法 | Critical Path Method | 時間 O(V + E)；空間 O(V) |
| Yen K 條最短簡單路徑 | Yen's K Shortest Paths | 時間 O(K·V·(E + V log V))；空間 O(K·V + E) |

### 11. 最小生成樹（4）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 克魯斯卡爾演算法 | Kruskal's Algorithm | 時間 O(E log E)；空間 O(V) |
| ★ 普林演算法 | Prim's Algorithm | 時間 O(E log V)；空間 O(V) |
| 博魯夫卡演算法 | Borůvka's Algorithm | 時間 O(E log V)；空間 O(V) |
| 次小生成樹 | Second-best MST | 時間 O(E log E + E·V)（用 LCA 倍增可到 O(E log V)）；空間 O(V + E) |

### 12. 網路流與匹配（12）

| 名稱 | English | 複雜度 |
|---|---|---|
| 福特–富爾克森演算法 | Ford–Fulkerson (DFS) | 時間 O(E · maxFlow)；空間 O(V + E) |
| 埃德蒙茲–卡普演算法 | Edmonds–Karp (BFS) | 時間 O(V · E²)；空間 O(V + E) |
| 迪尼茨演算法 | Dinic's Algorithm | 時間 O(V² · E)，單位容量 O(E√V)；空間 O(V + E) |
| 推送–重標記演算法 | Push–Relabel (FIFO) | 時間 O(V³)；空間 O(V + E) |
| 最小費用最大流 | Min-Cost Max-Flow (SPFA) | 時間 O(F · V · E)；空間 O(V + E) |
| 二分圖增廣路匹配 | Bipartite Matching (Kuhn's Augmenting Path) | 時間 O(V · E)；空間 O(V) |
| 霍普克洛夫特–卡普匹配 | Hopcroft–Karp | 時間 O(E √V)；空間 O(V) |
| 匈牙利演算法 | Hungarian Algorithm (Kuhn–Munkres) | 時間 O(n³)；空間 O(n²) |
| 穩定匹配（蓋爾–沙普利） | Gale–Shapley Stable Matching | 時間 O(n²)；空間 O(n²) |
| Karger 隨機最小割 | Karger Min Cut | 時間 單次 O(E α(V))；重複 O(n² log n) 次可高機率成功；空間 O(V + E) |
| Stoer–Wagner 全域最小割 | Stoer–Wagner Min Cut | 時間 O(V³)（用堆積可到 O(VE + V² log V)）；空間 O(V²) |
| Edmonds 花朵匹配 | Edmonds Blossom | 時間 O(V³)；空間 O(V + E) |

### 13. 貪婪演算法（6）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 活動選擇／區間排程 | Activity Selection / Interval Scheduling | 時間 O(n log n)；空間 O(1) |
| 區間分組 | Interval Partitioning | 時間 O(n log n)；空間 O(n) |
| 分數背包 | Fractional Knapsack | 時間 O(n log n)；空間 O(n) |
| 霍夫曼編碼 | Huffman Coding | 時間 O(n log n)；空間 O(n) |
| 工作排程 | Job Sequencing with Deadlines | 時間 O(n²)（可用並查集優化至 O(n log n)）；空間 O(n) |
| 最優合併模式 | Optimal Merge Pattern | 時間 O(n log n)；空間 O(n) |

### 14. 動態規劃（31）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 費氏數列 | Fibonacci (Naive / Memo / Tabulation) | 時間 遞迴 O(φⁿ)，DP O(n)；空間 O(n) |
| ★ 爬樓梯 | Climbing Stairs | 時間 O(n · |steps|)；空間 O(n) |
| ★ 0/1 背包 | 0/1 Knapsack | 時間 O(n · W)；空間 O(n · W) |
| 完全背包 | Unbounded Knapsack | 時間 O(n · W)；空間 O(W) |
| 多重背包 | Bounded Knapsack (Binary Splitting) | 時間 O(W · Σ log c)；空間 O(W) |
| 零錢兌換 | Coin Change | 時間 O(A · |coins|)；空間 O(A) |
| 子集合和 | Subset Sum | 時間 O(n · T)；空間 O(n · T) |
| 最長共同子序列 | Longest Common Subsequence | 時間 O(n · m)；空間 O(n · m) |
| 最長遞增子序列 | Longest Increasing Subsequence | 時間 O(n²) 或 O(n log n)；空間 O(n) |
| 編輯距離 | Edit Distance (Levenshtein) | 時間 O(n · m)；空間 O(n · m) |
| 矩陣鏈乘法 | Matrix Chain Multiplication | 時間 O(n³)；空間 O(n²) |
| 網格路徑 | Grid Paths (Count / Min Path Sum) | 時間 O(R · C)；空間 O(R · C) |
| 區間動態規劃（石子合併） | Interval DP (Stone Merging) | 時間 O(n³)；空間 O(n²) |
| 樹形動態規劃（獨立集） | Tree DP (Max Weight Independent Set) | 時間 O(n)；空間 O(h) |
| 狀態壓縮動態規劃（指派） | Bitmask DP (Assignment Problem) | 時間 O(2ⁿ · n)；空間 O(2ⁿ) |
| 數位動態規劃 | Digit DP | 時間 O(位數 · S · 10)；空間 O(位數 · S) |
| 旅行推銷員問題 | TSP — Held–Karp | 時間 O(2ⁿ · n²)；空間 O(2ⁿ · n) |
| 加權區間排程 | Weighted Interval Scheduling | 時間 O(n log n)；空間 O(n) |
| 鋼條切割 | Rod Cutting | 時間 O(n²)；空間 O(n) |
| 單字拆分 | Word Break | 時間 O(n · L)（L 為最長單字長度）；空間 O(n + 字典總長) |
| 最長共同子字串 | Longest Common Substring | 時間 O(nm)；空間 O(nm)（可壓成 O(m)） |
| 最長回文子序列 | Longest Palindromic Subsequence | 時間 O(n²)；空間 O(n²) |
| 回文分割最少切割 | Palindrome Partitioning DP | 時間 O(n²)；空間 O(n²) |
| 最佳二元搜尋樹 | Optimal BST | 時間 O(n³)；空間 O(n²) |
| 雞蛋掉落問題 | Egg Dropping | 時間 O(k · m)（m 為答案）；空間 O(k) |
| 輪廓線動態規劃 | Profile DP (Domino Tiling) | 時間 O(C · R · 2^R)；空間 O(2^R) |
| 子集合和變換 DP | Sum over Subsets DP | 時間 O(n · 2^n)；空間 O(2^n) |
| 分治 DP 最佳化 | Divide and Conquer DP Optimization | 時間 O(k · n log n)；空間 O(kn) |
| Knuth 最佳化 | Knuth Optimization | 時間 O(n²)；空間 O(n²) |
| 凸包技巧 | Convex Hull Trick | 時間 O(n)（斜率與查詢都單調）；空間 O(n) |
| 李超線段樹 | Li Chao Tree | 時間 插入與查詢各 O(log X)；空間 O(X)（或動態開點 O(n log X)） |

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
| 漢米爾頓路徑 | Hamiltonian Path (Backtracking) | 時間 O(V!)；空間 O(V) |
| 精確覆蓋（舞蹈鏈） | Exact Cover — Knuth Algorithm X (Dancing Links) | 時間 最差指數級；空間 O(1 的個數) |
| 分支限界法 | Branch and Bound (0/1 Knapsack) | 時間 最差 O(2ⁿ)；空間 O(2ⁿ) |

### 16. 字串演算法（22）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 暴力字串匹配 | Naive String Matching | 時間 O(n · m)；空間 O(1) |
| ★ KMP 字串匹配 | Knuth–Morris–Pratt | 時間 O(n + m)；空間 O(m) |
| 拉賓–卡普字串匹配 | Rabin–Karp | 時間 平均 O(n + m)，最差 O(n · m)；空間 O(1) |
| 博耶–摩爾字串匹配 | Boyer–Moore (Bad Character + Good Suffix) | 時間 最佳 O(n/m)，最差 O(n · m)；空間 O(m + σ) |
| 霍斯普爾字串匹配 | Boyer–Moore–Horspool | 時間 平均 O(n)，最差 O(n · m)；空間 O(σ) |
| Z 函數字串匹配 | Z Algorithm | 時間 O(n)；空間 O(n) |
| AC 自動機多模式匹配 | Aho–Corasick | 時間 O(n + Σ|P| + 出現次數)；空間 O(Σ|P| · σ) |
| 曼納徹最長回文 | Manacher's Algorithm | 時間 O(n)；空間 O(n) |
| 滾動雜湊 | Rolling Hash (Polynomial Prefix Hash) | 時間 預處理 O(n)，查詢 O(1)；空間 O(n) |
| 後綴陣列建構 | Suffix Array (Prefix Doubling) | 時間 O(n log² n)（基數排序可到 O(n log n)）；空間 O(n) |
| 最長共同前綴陣列 | Kasai's LCP Array | 時間 O(n)；空間 O(n) |
| 後綴自動機 | Suffix Automaton | 時間 O(n·σ)（均攤每字元 O(1) 個新狀態）；空間 O(n·σ) |
| Ukkonen 後綴樹 | Ukkonen Suffix Tree | 時間 O(n)（字母表大小視為常數）；空間 O(n) |
| 回文樹 | Palindromic Tree (Eertree) | 時間 O(n)（均攤）；空間 O(n·σ) |
| Shift-And 位元字串匹配 | Shift-And (Bitap) | 時間 O(n · ⌈m / w⌉)；空間 O(σ + m) |
| Thompson NFA 建構 | Thompson NFA Construction | 時間 O(m)；空間 O(m) |
| NFA 轉 DFA 子集合建構 | NFA to DFA Subset Construction | 時間 O(2^n · σ)（最壞），通常遠小於此；空間 O(2^n) |
| Hopcroft DFA 最小化 | Hopcroft DFA Minimization | 時間 O(n · σ · log n)；空間 O(n · σ) |
| Burrows–Wheeler 轉換 | Burrows–Wheeler Transform | 時間 轉換 O(n log n)（用後綴陣列），逆轉換 O(n)；空間 O(n) |
| 移至前端轉換 | Move-to-Front Transform | 時間 O(n · σ)；空間 O(σ) |
| FM 索引 | FM-index | 時間 建構 O(n log n)，查詢 O(m)；空間 O(n · σ)（可壓縮） |
| 正規 Huffman 編碼 | Canonical Huffman Coding | 時間 O(σ log σ)；空間 O(σ) |

### 17. 數學與數論（21）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 歐幾里得最大公因數 | Euclidean GCD | 時間 O(log min(a, b))；空間 O(1) |
| 擴展歐幾里得 | Extended Euclidean Algorithm | 時間 O(log min(a, b))；空間 O(1) |
| 最小公倍數 | Least Common Multiple | 時間 O(k log M)；空間 O(1) |
| ★ 埃拉托斯特尼質數篩 | Sieve of Eratosthenes | 時間 O(N log log N)；空間 O(N) |
| 線性篩 | Linear Sieve (Euler) | 時間 O(N)；空間 O(N) |
| 分段篩 | Segmented Sieve | 時間 O((R − L + 1) log log R + √R)；空間 O(√R + R − L) |
| 質因數分解 | Prime Factorization (Trial Division) | 時間 O(√n)；空間 O(log n) |
| ★ 快速冪 | Binary Exponentiation | 時間 O(log n)；空間 O(1) |
| 模冪 | Modular Exponentiation (Left-to-Right) | 時間 O(log n)；空間 O(1) |
| 模反元素 | Modular Inverse | 時間 O(log m)；空間 O(1) |
| 中國剩餘定理 | Chinese Remainder Theorem | 時間 O(k log M)；空間 O(1) |
| 米勒–拉賓質數測試 | Miller–Rabin Primality Test | 時間 O(k log³ n)；空間 O(1) |
| 矩陣快速冪 | Matrix Exponentiation (Fibonacci) | 時間 O(k³ log n)；空間 O(k²) |
| 快速傅立葉轉換 | Fast Fourier Transform (Polynomial Multiplication) | 時間 O(n log n)；空間 O(n) |
| 歐拉函數 φ(n) | Euler's Totient Function | 時間 O(√n)；空間 O(1) |
| Pollard Rho 質因數分解 | Pollard's Rho Factorization | 時間 期望約 O(n^{1/4}) 次 gcd；空間 O(log n) |
| 數論轉換 NTT | Number Theoretic Transform | 時間 O(n log n)；空間 O(n) |
| Lucas 定理 | Lucas's Theorem | 時間 O(p + log_p n)；空間 O(p) |
| 莫比烏斯函數篩 | Möbius Function Sieve | 時間 O(N)；空間 O(N) |
| 莫比烏斯反演 | Möbius Inversion | 時間 O(N log N)；空間 O(N) |
| 大步小步離散對數 | Baby-step Giant-step | 時間 O(√M)；空間 O(√M) |

### 17.1. 線性代數與數值方法（12）

| 名稱 | English | 複雜度 |
|---|---|---|
| 牛頓法 | Newton's Method | 時間 每步 O(1)，二次收斂；空間 O(1) |
| 二分求根 | Bisection Method | 時間 O(log((b−a)/ε))；空間 O(1) |
| 高斯消去法 | Gaussian Elimination (Partial Pivoting) | 時間 O(n³)；空間 O(n²) |
| 高斯–喬登消去法 | Gauss–Jordan Elimination | 時間 O(n³)；空間 O(n²) |
| LU 分解 | LU Decomposition (Partial Pivoting) | 時間 分解 O(n³)，每次求解 O(n²)；空間 O(n²) |
| QR 分解 | QR Decomposition (Modified Gram–Schmidt) | 時間 O(mn²)；空間 O(mn) |
| 冪迭代法 | Power Iteration | 時間 每步 O(n²)；空間 O(n) |
| 共軛梯度法 | Conjugate Gradient | 時間 每步 O(n²)，至多 n 步；空間 O(n) |
| 割線法 | Secant Method | 時間 每步一次函數求值，超線性收斂；空間 O(1) |
| 辛普森積分法 | Composite Simpson's Rule | 時間 O(n)；空間 O(1) |
| 四階 Runge–Kutta 法 | Runge–Kutta 4 (RK4) | 時間 每步 4 次 f 求值；空間 O(1) |
| 線性規劃單純形法 | Simplex Method (Two-Phase, Bland) | 時間 最壞指數時間，實務上通常很快；空間 O(mn) |

### 18. 計算幾何（18）

| 名稱 | English | 複雜度 |
|---|---|---|
| 向量叉積與方向判斷 | Cross Product & Orientation | 時間 O(1)；空間 O(1) |
| 線段相交 | Segment Intersection Test | 時間 O(1)；空間 O(1) |
| 點在多邊形內判定 | Point in Polygon (Ray Casting) | 時間 O(n)；空間 O(1) |
| ★ 凸包：葛立恆掃描 | Convex Hull — Graham Scan | 時間 O(n log n)；空間 O(n) |
| ★ 凸包：單調鏈 | Convex Hull — Andrew Monotone Chain | 時間 O(n log n)；空間 O(n) |
| ★ 凸包：禮物包裝法 | Convex Hull — Gift Wrapping | 時間 O(n · h)；空間 O(h) |
| 最近點對 | Closest Pair of Points (Divide & Conquer) | 時間 O(n log n)；空間 O(n) |
| 掃描線（矩形聯集面積） | Sweep Line — Area of Union of Rectangles | 時間 O(n² log n)（線段樹可到 O(n log n)）；空間 O(n) |
| 旋轉卡尺 | Rotating Calipers (Diameter) | 時間 O(n log n)（凸包）+ O(h)；空間 O(h) |
| 多邊形裁切 | Polygon Clipping (Sutherland–Hodgman) | 時間 O(n · m)；空間 O(n + m) |
| 沃羅諾伊圖 | Voronoi Diagram (Half-plane Intersection) | 時間 O(n² · n)（教學版）；空間 O(n²) |
| 德勞內三角剖分 | Delaunay Triangulation (Bowyer–Watson) | 時間 平均 O(n log n)，最差 O(n²)；空間 O(n) |
| 鞋帶公式（多邊形面積） | Shoelace Formula | 時間 O(n)；空間 O(1) |
| 快速凸包 | Quickhull | 時間 平均 O(n log n)，最差 O(n²)；空間 O(n) |
| Bentley–Ottmann 線段交點 | Bentley–Ottmann Sweep | 時間 O((n + k) log n)，k 為交點數；空間 O(n + k) |
| Fortune Voronoi 建構 | Fortune's Sweep Line Algorithm | 時間 O(n log n)（本頁用陣列存海灘線，為 O(n²)）；空間 O(n) |
| 耳切法三角剖分 | Ear Clipping Triangulation | 時間 O(n²)（每次找耳朵 O(n)，每次檢查 O(n) 時為 O(n³)）；空間 O(n) |
| 半平面交 | Half-plane Intersection (Sort + Deque) | 時間 O(n log n)；空間 O(n) |

### 21. 密碼學（16）

| 名稱 | English | 複雜度 |
|---|---|---|
| 凱撒密碼 | Caesar Cipher | 時間 O(n)；空間 O(n) |
| 維吉尼亞密碼 | Vigenère Cipher | 時間 O(n)；空間 O(n) |
| 仿射密碼 | Affine Cipher | 時間 O(n)；空間 O(n) |
| 柵欄密碼 | Rail Fence Cipher | 時間 O(n)；空間 O(n·k) |
| 欄式換位密碼 | Columnar Transposition | 時間 O(n log k)（排序關鍵字）；空間 O(n) |
| 普萊費爾密碼 | Playfair Cipher | 時間 O(n)；空間 O(1)（25 格表） |
| 字母頻率分析 | Frequency Analysis | 時間 O(n + 26²)；空間 O(26) |
| 一次性密碼本 | One-Time Pad | 時間 O(n)；空間 O(n) |
| 希爾密碼 | Hill Cipher | 時間 O(n·d)（d 為區塊大小）；空間 O(d²) |
| RSA 非對稱加密 | RSA Encryption | 時間 模冪 O(log e) 次乘法；空間 O(1) |
| Diffie–Hellman 金鑰交換 | Diffie–Hellman Key Exchange | 時間 O(log p) 次乘法；空間 O(1) |
| 進階加密標準 | AES-128 | 時間 固定 10 輪（每區塊 O(1)）；空間 176 位元組輪金鑰 |
| CBC 與 CTR 區塊模式 | CBC and CTR Modes | 時間 O(區塊數)；空間 O(n) |
| SHA-256 雜湊 | SHA-256 | 時間 O(n)；空間 O(1)（每區塊 64 字排程） |
| 金鑰式訊息驗證碼 | HMAC-SHA256 | 時間 O(n)（兩次 SHA-256）；空間 O(1) |
| RSA-PSS 數位簽章 | RSA-PSS Signature | 時間 簽章 O(log d)、驗證 O(log e) 次大數乘法；空間 O(n 的位元數) |

### 22. 影像處理（20）

| 名稱 | English | 複雜度 |
|---|---|---|
| 影像卷積 | Image Convolution (Correlation) | 時間 O(HW·k²)；空間 O(HW) |
| 高斯模糊 | Gaussian Blur (Separable) | 時間 O(HW·k)（可分離）；空間 O(HW) |
| 中值濾波 | Median Filter | 時間 O(HW·k²)（快速選擇）；空間 O(k²) |
| Sobel 梯度 | Sobel Operator | 時間 O(HW)；空間 O(HW) |
| 影像局部非極大值抑制 | Non-maximum Suppression (Local Maxima) | 時間 O(HW·k²)；空間 O(HW) |
| Harris 角點偵測 | Harris Corner Detector | 時間 O(HW)；空間 O(HW) |
| Shi–Tomasi 角點偵測 | Shi–Tomasi (Good Features to Track) | 時間 O(HW + m log m)；空間 O(HW) |
| Canny 邊緣偵測 | Canny Edge Detector | 時間 O(HW)；空間 O(HW) |
| 大津二值化 | Otsu's Thresholding | 時間 O(HW + L)，L = 256；空間 O(L) |
| 直方圖均衡化 | Histogram Equalization | 時間 O(HW + L)；空間 O(L) |
| 對比限制自適應直方圖均衡化 | CLAHE | 時間 O(HW + T·L)；空間 O(T·L) |
| 形態學侵蝕與膨脹 | Morphology: Erosion & Dilation | 時間 O(HW·k)；空間 O(HW) |
| 洪水填色 | Flood Fill (BFS) | 時間 O(HW)；空間 O(HW) |
| 連通元件標記 | Connected-component Labeling (Two-pass + Union-Find) | 時間 O(HW·α(HW))；空間 O(HW) |
| Hough 直線轉換 | Hough Line Transform | 時間 O(E·Θ)，E 為邊緣點數；空間 O(Θ·R) |
| 隨機抽樣一致性 | RANSAC (Line Fitting) | 時間 O(k·n)，k 為迭代次數；空間 O(n) |
| Lucas–Kanade 光流 | Lucas–Kanade Optical Flow | 時間 O(HW·w²)；空間 O(HW) |
| 距離轉換 | Distance Transform (Multi-source BFS) | 時間 O(HW)；空間 O(HW) |
| 分水嶺分割 | Watershed (Priority Flood) | 時間 O(HW log HW)；空間 O(HW) |
| 接縫裁切 | Seam Carving | 時間 每條接縫 O(HW)；空間 O(HW) |

### 23. 機器學習與隨機最佳化（16）

| 名稱 | English | 複雜度 |
|---|---|---|
| 梯度下降 | Gradient Descent | 時間 每步 O(1)；空間 O(1) |
| K 平均分群 | K-Means Clustering (Lloyd) | 時間 O(n · k · 迭代數)；空間 O(n + k) |
| K 近鄰分類 | k-Nearest Neighbors | 時間 每次查詢 O(n log n)；空間 O(n) |
| 線性迴歸 | Linear Regression | 時間 解析解 O(n)；梯度下降每輪 O(n)；空間 O(1) |
| 邏輯斯迴歸 | Logistic Regression | 時間 每輪 O(n·d)；空間 O(d) |
| 樸素貝氏分類 | Multinomial Naive Bayes | 時間 訓練 O(總字數)，預測 O(字數·類別數)；空間 O(字彙數·類別數) |
| 決策樹學習 | Decision Tree (CART, Gini) | 時間 O(d·n² · 深度)（教學版）；空間 O(n) |
| 密度式分群 | DBSCAN | 時間 O(n²)（無空間索引）；空間 O(n) |
| 階層式凝聚分群 | Agglomerative Hierarchical Clustering | 時間 O(n² log n)；空間 O(n²) |
| 主成分分析 | Principal Component Analysis | 時間 O(n·d² + d³)；空間 O(d²) |
| 反向傳播 | Backpropagation | 時間 每次前向＋反向 O(參數數)；空間 O(參數數) |
| 隨機梯度下降 | Stochastic Gradient Descent | 時間 每次更新 O(1)（單筆）；空間 O(1) |
| Adam 最佳化器 | Adam Optimizer | 時間 每步 O(參數數)；空間 O(參數數) |
| 模擬退火 | Simulated Annealing (TSP) | 時間 O(步數)；空間 O(n) |
| 遺傳演算法 | Genetic Algorithm (0/1 Knapsack) | 時間 O(代數 · 族群數 · n)；空間 O(族群數 · n) |
| 別名抽樣法 | Alias Method (Vose's) | 時間 建表 O(n)，每次抽樣 O(1)；空間 O(n) |

### 19. 隨機化與資料抽樣（5）

| 名稱 | English | 複雜度 |
|---|---|---|
| ★ 費雪–葉茲洗牌 | Fisher–Yates Shuffle | 時間 O(n)；空間 O(1) |
| 蓄水池抽樣 | Reservoir Sampling (Algorithm R) | 時間 O(n)；空間 O(k) |
| 隨機化快速選擇 | Randomized Quickselect | 時間 期望 O(n)；空間 O(1) |
| 蒙地卡羅估算 | Monte Carlo Estimation of π | 時間 O(n)；空間 O(1) |
| 隨機漫步 | Random Walk | 時間 O(n)；空間 O(n) |

### 20. 其他應用領域（10）

| 名稱 | English | 複雜度 |
|---|---|---|
| 游程編碼 | Run-Length Encoding | 時間 O(n)；空間 O(n) |
| LZ77 滑動視窗壓縮 | LZ77 (Sliding Window) | 時間 O(n · W)；空間 O(W) |
| LZ78 字典壓縮 | LZ78 (Dictionary) | 時間 O(n)；空間 O(n) |
| LZW 字典壓縮 | Lempel–Ziv–Welch | 時間 O(n)；空間 O(n) |
| 算術編碼 | Arithmetic Coding | 時間 O(n)；空間 O(σ) |
| 極小化極大搜尋 | Minimax | 時間 O(b^d)；空間 O(d) |
| α–β 剪枝 | Alpha–Beta Pruning | 時間 最佳 O(b^(d/2))；空間 O(d) |
| 蒙地卡羅樹搜尋 | Monte Carlo Tree Search (UCT) | 時間 O(迭代數 × 深度)；空間 O(樹的大小) |
| 網頁排名演算法 | PageRank (Power Iteration) | 時間 O(迭代數 · (V + E))；空間 O(V) |
| 河內塔 | Tower of Hanoi | 時間 O(2ⁿ)；空間 O(n) |
