def lcs(a, b):
    """dp[i][j] = a 前 i 字與 b 前 j 字的 LCS 長度；字元相同取左上 +1，否則取上方與左方較大者"""
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = dp[i - 1][j - 1] + 1 if a[i - 1] == b[j - 1] else max(dp[i - 1][j], dp[i][j - 1])
    out, i, j = [], m, n
    while i and j:  # 由右下角倒推還原一組 LCS
        if a[i - 1] == b[j - 1]:
            out.append(a[i - 1])
            i, j = i - 1, j - 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return dp[m][n], "".join(reversed(out))


length, s = lcs("ABCBDAB", "BDCABA")
print("LCS length =", length)
print("one LCS =", s)
