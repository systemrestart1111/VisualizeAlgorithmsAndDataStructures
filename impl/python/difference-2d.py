R, C = 5, 6
ops = [(0, 0, 2, 2, 3), (1, 2, 4, 5, 2), (3, 0, 4, 1, -1)]
D = [[0] * (C + 1) for _ in range(R + 1)]
naive = [[0] * C for _ in range(R)]
for r1, c1, r2, c2, v in ops:
    # 只改四個角
    D[r1][c1] += v
    D[r1][c2 + 1] -= v
    D[r2 + 1][c1] -= v
    D[r2 + 1][c2 + 1] += v
    for i in range(r1, r2 + 1):
        for j in range(c1, c2 + 1):
            naive[i][j] += v
# 二維前綴和還原
out = [[0] * C for _ in range(R)]
for i in range(R):
    for j in range(C):
        out[i][j] = D[i][j] + (out[i - 1][j] if i else 0) + (out[i][j - 1] if j else 0) - (out[i - 1][j - 1] if i and j else 0)
for row in out:
    print(" ".join(f"{x:2d}" for x in row))
print("matches naive:", out == naive)
