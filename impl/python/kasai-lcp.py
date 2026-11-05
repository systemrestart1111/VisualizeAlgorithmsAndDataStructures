def kasai(s, sa):
    """依原字串順序處理後綴；相鄰後綴的 LCP 最多只會比前一個少 1，因此總共只需 O(n) 次比較"""
    n = len(s)
    rank = [0] * n
    for i, p in enumerate(sa):
        rank[p] = i
    lcp, k = [0] * n, 0  # lcp[i] = sa[i] 與 sa[i-1] 的最長共同前綴
    for i in range(n):
        if rank[i] == 0:
            k = 0
            continue
        j = sa[rank[i] - 1]
        while i + k < n and j + k < n and s[i + k] == s[j + k]:
            k += 1
        lcp[rank[i]] = k
        if k:
            k -= 1
    return lcp


s = "banana$"
sa = sorted(range(len(s)), key=lambda i: s[i:])  # 這裡直接排序後綴取得後綴陣列
lcp = kasai(s, sa)
print(" i  SA LCP suffix")
for i, p in enumerate(sa):
    print(f"{i:2d} {p:3d} {lcp[i]:3d} {s[p:]}")
