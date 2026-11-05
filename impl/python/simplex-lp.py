EPS = 1e-9


def fmt(v):
    return f"{0.0 if abs(v) < 5e-7 else v:.6f}"


def simplex(c0, cons, is_min):
    """兩階段單純形法，入基／出基都用 Bland 法則（編號最小者）避免退化循環"""
    n, m = len(c0), len(cons)
    c = [-v for v in c0] if is_min else list(c0)
    rows = [([-v for v in a], -b) if op == ">=" else (list(a), b) for a, op, b in cons]
    art = [i for i, (a, b) in enumerate(rows) if b < 0]
    K = len(art)
    N = n + m + K
    T, basis = [], []
    for i, (a, b) in enumerate(rows):
        sg = -1 if b < 0 else 1
        row = [float(sg * v) for v in a] + [0.0] * (m + K) + [float(sg * b)]
        row[n + i] = float(sg)
        if b < 0:
            row[n + m + art.index(i)] = 1.0
            basis.append(n + m + art.index(i))
        else:
            basis.append(n + i)
        T.append(row)
    pivots = 0

    def pivot(pr, pc):
        pv = T[pr][pc]
        T[pr] = [v / pv for v in T[pr]]
        for i in range(len(T)):
            if i != pr and abs(T[i][pc]) > 1e-15:
                f = T[i][pc]
                T[i] = [v - f * w for v, w in zip(T[i], T[pr])]
        basis[pr] = pc

    def solve(cost, allowed):
        nonlocal pivots
        while True:
            e = -1
            for j in range(allowed):
                if j not in basis and sum(cost[basis[i]] * T[i][j] for i in range(len(T))) - cost[j] < -EPS:
                    e = j
                    break
            if e < 0:
                return True
            l, best = -1, float("inf")
            for i in range(len(T)):
                if T[i][e] > EPS:
                    q = T[i][N] / T[i][e]
                    if q < best - 1e-12 or (abs(q - best) <= 1e-12 and basis[i] < basis[l]):
                        best, l = q, i
            if l < 0:
                return False
            pivot(l, e)
            pivots += 1

    if K:
        cost1 = [-1.0 if j >= n + m else 0.0 for j in range(N)]
        solve(cost1, N)
        if sum(cost1[basis[i]] * T[i][N] for i in range(len(T))) < -1e-7:
            return "infeasible"
        for i in range(len(T) - 1, -1, -1):
            if basis[i] >= n + m:
                j = next((k for k in range(n + m) if abs(T[i][k]) > EPS), None)
                if j is None:
                    del T[i], basis[i]
                else:
                    pivot(i, j)
    cost2 = [c[j] if j < n else 0.0 for j in range(N)]
    if not solve(cost2, n + m):
        return "unbounded"
    x = [0.0] * n
    for i, bj in enumerate(basis):
        if bj < n:
            x[bj] = T[i][N]
    z = sum(c0[j] * x[j] for j in range(n))
    return f"optimal {'min' if is_min else 'max'} = {fmt(z)} at x = ({', '.join(fmt(v) for v in x)}), {pivots} pivots"


tests = [
    ("classic", [3, 5], [([1, 0], "<=", 4), ([0, 2], "<=", 12), ([3, 2], "<=", 18)], False),
    ("unbounded", [1, 1], [([1, -1], "<=", 2), ([-1, 1], "<=", 3)], False),
    ("infeasible", [1, 1], [([1, 1], "<=", 2), ([1, 1], ">=", 5)], False),
    ("min with >=", [2, 3], [([1, 1], ">=", 4), ([1, 3], ">=", 6), ([1, 0], "<=", 5)], True),
    ("degenerate", [2, 1], [([1, 1], "<=", 4), ([1, 0], "<=", 2), ([2, 1], "<=", 6)], False),
    ("Beale cycling", [0.75, -20, 0.5, -6], [([0.25, -8, -1, 9], "<=", 0), ([0.5, -12, -0.5, 3], "<=", 0), ([0, 0, 1, 0], "<=", 1)], False),
]
for name, c, cons, is_min in tests:
    print(f"{name}: {simplex(c, cons, is_min)}")
