GRID = ["1 3 1 2", "1 # 1 4", "4 2 1 3", "2 1 # 1"]  # 只能往右或往下，# 為障礙
g = [row.split() for row in GRID]
R, C = len(g), len(g[0])
INF = float("inf")

count = [[0] * C for _ in range(R)]  # 路徑數：來自上方 + 來自左方
best = [[INF] * C for _ in range(R)]  # 最小路徑和：min(上方, 左方) + 自己
for r in range(R):
    for c in range(C):
        if g[r][c] == "#":
            continue
        v = int(g[r][c])
        if r == 0 and c == 0:
            count[r][c], best[r][c] = 1, v
            continue
        up = (count[r - 1][c], best[r - 1][c]) if r else (0, INF)
        left = (count[r][c - 1], best[r][c - 1]) if c else (0, INF)
        count[r][c] = up[0] + left[0]
        best[r][c] = min(up[1], left[1]) + v
print("paths =", count[R - 1][C - 1])
print("min path sum =", best[R - 1][C - 1])
