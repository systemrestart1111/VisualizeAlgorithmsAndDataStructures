def z_function(s):
    """z[i] = s 與 s[i:] 的最長共同前綴長度；利用目前最右的 Z-box [l, r) 避免重複比較，O(n)"""
    n = len(s)
    z = [0] * n
    l = r = 0
    for i in range(1, n):
        if i < r:
            z[i] = min(r - i, z[i - l])
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1
        if i + z[i] > r:
            l, r = i, i + z[i]
    return z


s = "aab$baabaaab"
z = z_function(s)
m = s.index("$")  # 把「樣式$文字」接起來，z[i] == len(樣式) 就是一次匹配
print("z:", *z)
print("pattern", s[:m], "found in text at:", *(i - m - 1 for i in range(len(s)) if z[i] == m))
