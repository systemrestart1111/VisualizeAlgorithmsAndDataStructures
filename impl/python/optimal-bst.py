KEYS = [10, 20, 30, 40, 50]
P = [15, 10, 5, 10, 20]          # 成功搜尋頻率
Q = [5, 10, 5, 5, 5, 10]         # 失敗搜尋頻率（落在鍵之間）
n = len(KEYS)
e = [[0] * (n + 1) for _ in range(n + 2)]
w = [[0] * (n + 1) for _ in range(n + 2)]
root = [[0] * (n + 1) for _ in range(n + 1)]
for i in range(1, n + 2):
    e[i][i - 1] = w[i][i - 1] = Q[i - 1]
for length in range(1, n + 1):
    for i in range(1, n - length + 2):
        j = i + length - 1
        w[i][j] = w[i][j - 1] + P[j - 1] + Q[j]
        e[i][j] = float("inf")
        for r in range(i, j + 1):  # 枚舉根
            t = e[i][r - 1] + e[r + 1][j] + w[i][j]
            if t < e[i][j]:
                e[i][j], root[i][j] = t, r


def preorder(i, j):
    if i > j:
        return []
    r = root[i][j]
    return [KEYS[r - 1]] + preorder(i, r - 1) + preorder(r + 1, j)


print("min expected cost:", e[1][n])
print("root:", KEYS[root[1][n] - 1], "| preorder:", *preorder(1, n))
