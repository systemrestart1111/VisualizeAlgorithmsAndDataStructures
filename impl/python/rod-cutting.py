def rod_cut(p):
    """dp[i] = max(p[k] + dp[i − k])，cut[i] 記錄最佳的第一段長度"""
    n = len(p)
    dp, cut = [0] * (n + 1), [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = -1
        for k in range(1, i + 1):
            if p[k - 1] + dp[i - k] > dp[i]:
                dp[i], cut[i] = p[k - 1] + dp[i - k], k
    parts, m = [], n
    while m:
        parts.append(cut[m])
        m -= cut[m]
    return dp, parts


p = [1, 5, 8, 9, 10, 17, 17, 20]
dp, parts = rod_cut(p)
print("dp:", *dp)
print("best:", dp[-1], "cut into", " + ".join(map(str, parts)))
brute = 0
for mask in range(1 << (len(p) - 1)):
    s, length = 0, 1
    for i in range(len(p) - 1):
        if mask >> i & 1:
            s, length = s + p[length - 1], 1
        else:
            length += 1
    brute = max(brute, s + p[length - 1])
print("brute force:", brute)
