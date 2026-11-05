def manacher(s):
    """在字元間插入 #，奇偶長度回文統一處理；利用目前最右回文的對稱性，p[i] 可從鏡像位置繼承，O(n)"""
    t = "#" + "#".join(s) + "#"
    n = len(t)
    p = [0] * n  # p[i] = 以 i 為中心的回文半徑（不含中心）
    c = r = 0
    for i in range(n):
        if i < r:
            p[i] = min(r - i, p[2 * c - i])
        while i - p[i] - 1 >= 0 and i + p[i] + 1 < n and t[i - p[i] - 1] == t[i + p[i] + 1]:
            p[i] += 1
        if i + p[i] > r:
            c, r = i, i + p[i]
    best = max(range(n), key=lambda i: p[i])  # 同長度取最先出現的
    start = (best - p[best]) // 2
    return s[start:start + p[best]], start


pal, start = manacher("babcbabcbaccba")
print("longest palindrome =", pal)
print("start =", start, "length =", len(pal))
