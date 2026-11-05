import math

PTS = [(2.0, 1.6), (3.1, 2.4), (4.2, 2.6), (5.0, 3.5), (5.9, 3.7), (6.8, 4.6), (7.7, 4.4), (8.9, 5.6), (4.6, 3.6), (6.1, 3.0)]


def pca(P, standardize):
    """中心化（可選標準化）→ 共變異數矩陣 → 2×2 對稱矩陣的特徵分解"""
    n = len(P)
    mx = sum(p[0] for p in P) / n
    my = sum(p[1] for p in P) / n
    X = [(x - mx, y - my) for x, y in P]
    if standardize:
        sx = math.sqrt(sum(x * x for x, _ in X) / (n - 1))
        sy = math.sqrt(sum(y * y for _, y in X) / (n - 1))
        X = [(x / sx, y / sy) for x, y in X]
    a = sum(x * x for x, _ in X) / (n - 1)
    b = sum(x * y for x, y in X) / (n - 1)
    c = sum(y * y for _, y in X) / (n - 1)
    tr, det = a + c, a * c - b * b
    disc = math.sqrt(max(0.0, (tr / 2) ** 2 - det))
    l1, l2 = tr / 2 + disc, tr / 2 - disc
    v = (l1 - c, b) if abs(b) > 1e-12 else ((1.0, 0.0) if a >= c else (0.0, 1.0))
    nv = math.hypot(*v)
    v = (v[0] / nv, v[1] / nv)
    if v[0] < 0:
        v = (-v[0], -v[1])
    z = [x * v[0] + y * v[1] for x, y in X]
    return (a, b, c), l1, l2, v, z


for name, P in [("original", PTS), ("x scaled by 10", [(10 * x, y) for x, y in PTS])]:
    for std in [False, True]:
        (a, b, c), l1, l2, v, z = pca(P, std)
        print(f"{name}, {'standardized' if std else 'centered'}: cov [{a:.3f} {b:.3f}; {b:.3f} {c:.3f}], eigenvalues {l1:.3f} {l2:.3f} "
              f"(sum {l1 + l2:.3f} = trace {a + c:.3f}), PC1 ({v[0]:.3f}, {v[1]:.3f}) explains {100 * l1 / (l1 + l2):.2f}%, first projections {z[0]:.3f} {z[1]:.3f}")
