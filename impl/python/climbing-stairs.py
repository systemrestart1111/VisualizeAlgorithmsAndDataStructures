def climb(n, steps):
    """dp[i] = 爬到第 i 階的方法數 = Σ dp[i - s]（s 為每次可爬的階數）"""
    dp = [1] + [0] * n
    for i in range(1, n + 1):
        dp[i] = sum(dp[i - s] for s in steps if i >= s)
    return dp


dp = climb(8, [1, 2])
print("ways(8) =", dp[8])
print("dp:", *dp)
