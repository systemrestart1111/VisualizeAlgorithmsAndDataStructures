def edit_distance(a, b):
    """dp[i][j] = a 前 i 字變成 b 前 j 字的最少操作數（插入、刪除、替換各算 1）"""
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])  # 刪除、插入、替換
    ops, i, j = [], m, n
    while i or j:  # 倒推出一組操作
        if i and j and a[i - 1] == b[j - 1]:
            i, j = i - 1, j - 1
        elif i and j and dp[i][j] == dp[i - 1][j - 1] + 1:
            ops.append(f"replace {a[i - 1]}->{b[j - 1]}")
            i, j = i - 1, j - 1
        elif i and dp[i][j] == dp[i - 1][j] + 1:
            ops.append(f"delete {a[i - 1]}")
            i -= 1
        else:
            ops.append(f"insert {b[j - 1]}")
            j -= 1
    return dp[m][n], ops[::-1]


d, ops = edit_distance("kitten", "sitting")
print("distance =", d)
print("ops:", ", ".join(ops))
