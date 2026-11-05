import math


def fmt(v):
    return f"{0.0 if abs(v) < 5e-7 else v:.6f}"


def qr(A):
    """修正版 Gram–Schmidt：依序扣掉在每個 q 上的投影，剩下的正規化成新的 q"""
    m, n = len(A), len(A[0])
    Q = [[0.0] * n for _ in range(m)]
    R = [[0.0] * n for _ in range(n)]
    for j in range(n):
        v = [float(A[i][j]) for i in range(m)]
        for i in range(j):
            R[i][j] = sum(Q[k][i] * v[k] for k in range(m))
            for k in range(m):
                v[k] -= R[i][j] * Q[k][i]
        nv = math.sqrt(sum(x * x for x in v))
        if nv < 1e-9:
            return None, j
        R[j][j] = nv
        for k in range(m):
            Q[k][j] = v[k] / nv
    return (Q, R), -1


for A in [[[12, -51, 4], [6, 167, -68], [-4, 24, -41]], [[1, 1], [1, 0], [0, 1]], [[1, 2], [2, 4]]]:
    res, bad = qr(A)
    if res is None:
        print(f"column {bad + 1} is linearly dependent")
        continue
    Q, R = res
    m, n = len(A), len(A[0])
    for i in range(m):
        print("Q: " + " ".join(fmt(v) for v in Q[i]))
    for i in range(n):
        print("R: " + " ".join(fmt(v) for v in R[i]))
    e1 = max(abs(sum(Q[k][i] * Q[k][j] for k in range(m)) - (1 if i == j else 0)) for i in range(n) for j in range(n))
    e2 = max(abs(sum(Q[i][k] * R[k][j] for k in range(n)) - A[i][j]) for i in range(m) for j in range(n))
    print(f"QtQ = I: {e1 < 1e-9}, QR = A: {e2 < 1e-9}")
