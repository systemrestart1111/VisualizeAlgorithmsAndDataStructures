def fmt(v):
    return f"{0.0 if abs(v) < 5e-7 else v:.6f}"


def lu(A):
    """PA = LU（部分樞軸）；交換列時 L 已算好的欄也要一起交換"""
    n = len(A)
    U = [[float(v) for v in row] for row in A]
    L = [[1.0 if i == j else 0.0 for j in range(n)] for i in range(n)]
    perm = list(range(n))
    for k in range(n):
        p = max(range(k, n), key=lambda i: abs(U[i][k]))
        if p != k:
            U[k], U[p] = U[p], U[k]
            perm[k], perm[p] = perm[p], perm[k]
            for j in range(k):
                L[k][j], L[p][j] = L[p][j], L[k][j]
        if abs(U[k][k]) < 1e-12:
            return None, k
        for i in range(k + 1, n):
            f = U[i][k] / U[k][k]
            L[i][k] = f
            for j in range(k, n):
                U[i][j] -= f * U[k][j]
    return (perm, L, U), -1


for A in [[[2, 1, 1, 0], [4, 3, 3, 1], [8, 7, 9, 5], [6, 7, 9, 8]], [[1, 2, 3], [2, 4, 6], [1, 0, 1]], [[0, 1], [1, 0]]]:
    res, bad = lu(A)
    if res is None:
        print(f"singular: no pivot in column {bad + 1}")
        continue
    perm, L, U = res
    n = len(A)
    print("perm: " + " ".join(str(p) for p in perm))
    for i in range(n):
        print("L: " + " ".join(fmt(v) for v in L[i]) + " | U: " + " ".join(fmt(v) for v in U[i]))
    err = max(abs(A[perm[i]][j] - sum(L[i][k] * U[k][j] for k in range(n))) for i in range(n) for j in range(n))
    print(f"PA = LU: {err < 1e-9}")
