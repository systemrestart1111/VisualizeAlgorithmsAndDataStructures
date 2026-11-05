def stone_merge(a):
    """opt[i][j−1] ≤ opt[i][j] ≤ opt[i+1][j]：只在這個範圍內枚舉切點"""
    n = len(a)
    S = [0]
    for x in a:
        S.append(S[-1] + x)
    dp = [[0] * n for _ in range(n)]
    opt = [[i if i == j else 0 for j in range(n)] for i in range(n)]
    evals = 0
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = float("inf")
            for m in range(opt[i][j - 1], min(opt[i + 1][j], j - 1) + 1):
                evals += 1
                t = dp[i][m] + dp[m + 1][j] + S[j + 1] - S[i]
                if t < dp[i][j]:
                    dp[i][j], opt[i][j] = t, m
    return dp[0][n - 1], evals


def naive(a):
    n = len(a)
    S = [0]
    for x in a:
        S.append(S[-1] + x)
    dp = [[0] * n for _ in range(n)]
    cnt = 0
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = float("inf")
            for m in range(i, j):
                cnt += 1
                dp[i][j] = min(dp[i][j], dp[i][m] + dp[m + 1][j] + S[j + 1] - S[i])
    return dp[0][n - 1], cnt


for a in ([4, 1, 7, 3, 9, 2, 6, 5], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]):
    (k, e1), (v, e2) = stone_merge(a), naive(a)
    print(f"{a}: knuth {k} ({e1} evals), naive {v} ({e2} evals)")
