INF = float("inf")
COST = [[9, 2, 7, 8],
        [6, 4, 3, 7],
        [5, 8, 1, 8],
        [7, 6, 9, 4]]


def hungarian(a):
    """匈牙利演算法 O(n^3)：以位能 u、v 維持「縮減成本 >= 0」，每次加入一列並沿零成本邊找增廣路徑"""
    n = len(a)
    u, v = [0] * (n + 1), [0] * (n + 1)
    p, way = [0] * (n + 1), [0] * (n + 1)  # p[j] = 第 j 欄配到的列（1 起算）
    for i in range(1, n + 1):
        p[0], j0 = i, 0
        minv, used = [INF] * (n + 1), [False] * (n + 1)
        while True:
            used[j0] = True
            i0, delta, j1 = p[j0], INF, 0
            for j in range(1, n + 1):
                if not used[j]:
                    cur = a[i0 - 1][j - 1] - u[i0] - v[j]
                    if cur < minv[j]:
                        minv[j], way[j] = cur, j0
                    if minv[j] < delta:
                        delta, j1 = minv[j], j
            for j in range(n + 1):
                if used[j]:
                    u[p[j]] += delta
                    v[j] -= delta
                else:
                    minv[j] -= delta
            j0 = j1
            if p[j0] == 0:
                break
        while j0:  # 沿 way 回溯翻轉
            j1 = way[j0]
            p[j0] = p[j1]
            j0 = j1
    assign = [0] * n
    for j in range(1, n + 1):
        assign[p[j] - 1] = j - 1
    return assign


assign = hungarian(COST)
for i, j in enumerate(assign):
    print(f"row {i} -> col {j} (cost {COST[i][j]})")
print("total cost =", sum(COST[i][j] for i, j in enumerate(assign)))
