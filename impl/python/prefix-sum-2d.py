def build(a):
    """P[i][j] = 左上角 (0,0) 到 (i-1, j-1) 的總和"""
    R, C = len(a), len(a[0])
    P = [[0] * (C + 1) for _ in range(R + 1)]
    for i in range(1, R + 1):
        for j in range(1, C + 1):
            P[i][j] = a[i - 1][j - 1] + P[i - 1][j] + P[i][j - 1] - P[i - 1][j - 1]
    return P


def query(P, r1, c1, r2, c2):
    return P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1]


a = [[3, 0, 1, 4, 2], [5, 6, 3, 2, 1], [1, 2, 0, 1, 5], [4, 1, 0, 1, 7], [1, 0, 3, 0, 5]]
P = build(a)
for q in ((1, 1, 3, 3), (0, 0, 4, 4), (2, 2, 2, 2), (0, 3, 4, 4)):
    brute = sum(a[i][j] for i in range(q[0], q[2] + 1) for j in range(q[1], q[3] + 1))
    print(f"sum{q} = {query(P, *q)} (brute {brute})")
