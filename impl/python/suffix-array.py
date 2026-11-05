def suffix_array(s):
    """倍增法：先依第 1 個字元排名，之後每輪用 (前 k 字元排名, 接下來 k 字元排名) 排序，比較長度每輪加倍"""
    n = len(s)
    rank = [ord(ch) for ch in s]
    sa = list(range(n))
    k = 1
    while True:
        key = lambda i: (rank[i], rank[i + k] if i + k < n else -1)
        sa.sort(key=key)
        new = [0] * n
        for j in range(1, n):
            new[sa[j]] = new[sa[j - 1]] + (key(sa[j]) != key(sa[j - 1]))
        rank = new
        print(f"k={k}: ranks", *rank)
        if rank[sa[-1]] == n - 1:  # 排名全部不同就完成
            return sa
        k *= 2


s = "banana$"
sa = suffix_array(s)
print("SA:", *sa)
for i in sa:
    print(f"{i:2d} {s[i:]}")
