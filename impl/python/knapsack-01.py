ITEMS = [(1, 1), (3, 4), (4, 5), (5, 7)]  # (重量, 價值)
W = 7

# dp[i][w] = 只考慮前 i 件、容量 w 時的最大價值；第 i 件「不拿」或「拿」（每件只能拿一次）
n = len(ITEMS)
dp = [[0] * (W + 1) for _ in range(n + 1)]
for i in range(1, n + 1):
    wi, vi = ITEMS[i - 1]
    for w in range(W + 1):
        dp[i][w] = dp[i - 1][w]
        if w >= wi:
            dp[i][w] = max(dp[i][w], dp[i - 1][w - wi] + vi)

chosen, w = [], W
for i in range(n, 0, -1):  # 從表格倒推：值有變化就代表拿了第 i 件
    if dp[i][w] != dp[i - 1][w]:
        chosen.append(i)
        w -= ITEMS[i - 1][0]
print("best value =", dp[n][W])
print("items (1-based):", *sorted(chosen))
print("last row:", *dp[n])
