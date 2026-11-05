import math

PTS = [(0, 0), (4, 1), (6, 4), (3, 6), (1, 4), (5, 7)]
n = len(PTS)
d = [[math.dist(a, b) for b in PTS] for a in PTS]
INF = float("inf")
# 浮點數比較加上容許誤差：平手時固定選編號小的城市，不受各平台浮點運算細節影響
EPS = 1e-9

# dp[mask][j] = 從城市 0 出發、恰好走過 mask 中的城市、最後停在 j 的最短距離
dp = [[INF] * n for _ in range(1 << n)]
par = [[-1] * n for _ in range(1 << n)]
dp[1][0] = 0
for mask in range(1 << n):
    if not mask & 1:
        continue
    for j in range(n):
        if dp[mask][j] == INF or not mask >> j & 1:
            continue
        for k in range(n):
            if mask >> k & 1:
                continue
            nm = mask | 1 << k
            if dp[mask][j] + d[j][k] < dp[nm][k] - EPS:
                dp[nm][k], par[nm][k] = dp[mask][j] + d[j][k], j
full = (1 << n) - 1
best, last = INF, -1
for j in range(1, n):
    if dp[full][j] + d[j][0] < best - EPS:
        best, last = dp[full][j] + d[j][0], j
tour, mask = [], full
while last != -1:  # 沿 par 倒推路線
    tour.append(last)
    mask, last = mask ^ (1 << last), par[mask][last]
tour = tour[::-1] + [0]
print("tour:", " -> ".join(map(str, tour)))
print(f"length = {best:.4f}")
