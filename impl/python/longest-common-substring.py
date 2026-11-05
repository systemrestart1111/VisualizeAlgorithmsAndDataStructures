def lc_substring(a, b):
    """相同字元沿對角線延伸，不同就歸零；表中最大值即答案（必須連續）"""
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    best = end = 0
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
                if dp[i][j] > best:
                    best, end = dp[i][j], i
    return a[end - best:end]


def lcs_len(a, b):
    """對照：子序列允許跳過字元"""
    L = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            L[i][j] = L[i - 1][j - 1] + 1 if a[i - 1] == b[j - 1] else max(L[i - 1][j], L[i][j - 1])
    return L[-1][-1]


for a, b in [("ABABCABA", "BABCAACB"), ("ABCDXYZ", "XYZABCD"), ("ABC", "DEF")]:
    s = lc_substring(a, b)
    print(f"{a} / {b}: substring '{s}' ({len(s)}), subsequence length {lcs_len(a, b)}")
