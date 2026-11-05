import math


def fmt(v):
    return f"{0.0 if abs(v) < 5e-7 else v:.6f}"


def is_spd(A):
    """對稱且 Cholesky 成功才是對稱正定"""
    n = len(A)
    if any(A[i][j] != A[j][i] for i in range(n) for j in range(n)):
        return False
    L = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(i + 1):
            s = A[i][j] - sum(L[i][k] * L[j][k] for k in range(j))
            if i == j:
                if s <= 1e-12:
                    return False
                L[i][i] = math.sqrt(s)
            else:
                L[i][j] = s / L[j][j]
    return True


def cg(A, b):
    """方向 p 彼此 A-共軛：α = rᵀr / pᵀAp，β = r_newᵀr_new / rᵀr；至多 n 步"""
    n = len(A)
    x = [0.0] * n
    r = list(map(float, b))
    p = r[:]
    for k in range(1, n + 6):
        Ap = [sum(A[i][j] * p[j] for j in range(n)) for i in range(n)]
        rr = sum(v * v for v in r)
        alpha = rr / sum(p[i] * Ap[i] for i in range(n))
        x = [x[i] + alpha * p[i] for i in range(n)]
        rn = [r[i] - alpha * Ap[i] for i in range(n)]
        if math.sqrt(sum(v * v for v in rn)) < 1e-10:
            return x, k
        beta = sum(v * v for v in rn) / rr
        p = [rn[i] + beta * p[i] for i in range(n)]
        r = rn
    return x, None


for A, b in [([[3, 2], [2, 6]], [2, -8]), ([[4, 1, 0], [1, 3, 1], [0, 1, 2]], [1, 2, 3]), ([[4, 1], [1, 3]], [1, 2]), ([[1, 2], [2, 1]], [1, 1])]:
    if not is_spd(A):
        print("not symmetric positive definite: CG not applicable")
        continue
    x, k = cg(A, b)
    res = math.sqrt(sum((b[i] - sum(A[i][j] * x[j] for j in range(len(A)))) ** 2 for i in range(len(A))))
    print(f"x = ({', '.join(fmt(v) for v in x)}) in {k} steps (n = {len(A)}), residual small {res < 1e-9}")
