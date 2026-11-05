ITEMS = [(2, 3), (3, 5), (4, 7), (5, 8)]  # (重量, 價值)，每種可拿無限次
W = 11

# 一維 dp[w] 由小到大更新：dp[w - wi] 可能已經包含第 i 種，因此同一種能重複拿
dp = [0] * (W + 1)
for w in range(1, W + 1):
    for wi, vi in ITEMS:
        if w >= wi:
            dp[w] = max(dp[w], dp[w - wi] + vi)
print("best value =", dp[W])
print("dp:", *dp)
