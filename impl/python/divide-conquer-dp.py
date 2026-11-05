a = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8]
K = 4
n = len(a)
S = [0]
for x in a:
    S.append(S[-1] + x)
cost = lambda i, j: (S[j] - S[i]) ** 2
evals = 0


def solve(prev, cur, l, r, opt_l, opt_r):
    """最佳切點單調：先算 mid，再把左右兩半的搜尋範圍限制在 opt 兩側"""
    global evals
    if l > r:
        return
    mid = (l + r) // 2
    best, bi = float("inf"), opt_l
    for i in range(opt_l, min(mid - 1, opt_r) + 1):
        evals += 1
        v = prev[i] + cost(i, mid)
        if v < best:
            best, bi = v, i
    cur[mid] = best
    solve(prev, cur, l, mid - 1, opt_l, bi)
    solve(prev, cur, mid + 1, r, bi, opt_r)


dp = [cost(0, j) for j in range(n + 1)]
for g in range(2, K + 1):
    cur = [float("inf")] * (n + 1)
    solve(dp, cur, 1, n, 0, n - 1)
    dp = cur
naive_dp, naive = [cost(0, j) for j in range(n + 1)], 0
for g in range(2, K + 1):
    cur = [float("inf")] * (n + 1)
    for j in range(1, n + 1):
        for i in range(j):
            naive += 1
            cur[j] = min(cur[j], naive_dp[i] + cost(i, j))
    naive_dp = cur
print("min sum of squares:", dp[n], "| naive:", naive_dp[n])
print("transitions evaluated:", evals, "vs", naive)
