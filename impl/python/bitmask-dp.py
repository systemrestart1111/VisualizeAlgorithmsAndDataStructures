COST = [[9, 2, 7, 8], [6, 4, 3, 7], [5, 8, 1, 8], [7, 6, 9, 4]]  # COST[工人][工作]
n = len(COST)
INF = float("inf")

# dp[mask] = mask 這些工作已分配給前 popcount(mask) 位工人時的最小成本
dp = [INF] * (1 << n)
choice = [-1] * (1 << n)
dp[0] = 0
for mask in range(1 << n):
    if dp[mask] == INF:
        continue
    k = bin(mask).count("1")  # 下一位要分配的工人
    if k == n:
        continue
    for j in range(n):
        if not mask >> j & 1:
            nm = mask | 1 << j
            if dp[mask] + COST[k][j] < dp[nm]:
                dp[nm], choice[nm] = dp[mask] + COST[k][j], j
full, assign = (1 << n) - 1, [0] * n
mask = full
for k in range(n - 1, -1, -1):  # 倒推每位工人分到的工作
    assign[k] = choice[mask]
    mask ^= 1 << choice[mask]
for k, j in enumerate(assign):
    print(f"worker {k} -> job {j} (cost {COST[k][j]})")
print("min total cost =", dp[full])
