import math


def fmt(v):
    return f"{0.0 if abs(v) < 5e-7 else v:.6f}"


def power_iteration(A, x, steps=60):
    """x ← Ax / ‖Ax‖；Rayleigh 商 xᵀAx 估計主特徵值；方向不再改變（含正負號翻轉）即收斂"""
    n = len(A)
    nx = math.sqrt(sum(v * v for v in x))
    x = [v / nx for v in x]
    lam = 0.0
    for k in range(1, steps + 1):
        y = [sum(A[i][j] * x[j] for j in range(n)) for i in range(n)]
        lam = sum(x[i] * y[i] for i in range(n))
        ny = math.sqrt(sum(v * v for v in y))
        xn = [v / ny for v in y]
        d = min(math.sqrt(sum((xn[i] - x[i]) ** 2 for i in range(n))), math.sqrt(sum((xn[i] + x[i]) ** 2 for i in range(n))))
        x = xn
        if d < 1e-10:
            return lam, x, k
    return lam, x, None


for A, x0 in [([[2, 1], [1, 3]], [1, 0]), ([[2, 0, 0], [0, 1, 0], [0, 0, 3]], [1, 1, 1]), ([[4, 1], [2, 3]], [1, 1]), ([[0, 1], [1, 0]], [1, 0])]:
    lam, x, k = power_iteration(A, x0)
    if k is None:
        print(f"no convergence in 60 steps (|lambda1| = |lambda2|?)")
    else:
        print(f"lambda = {fmt(lam)}, x = ({', '.join(fmt(v) for v in x)}), steps {k}")
