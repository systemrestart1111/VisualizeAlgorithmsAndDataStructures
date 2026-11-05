import math


def eigen2(a, b, c, d):
    """2×2 矩陣的特徵值：λ² − tr·λ + det = 0"""
    tr, det = a + d, a * d - b * c
    disc = tr * tr - 4 * det
    if disc < 0:
        return None
    out = []
    for lam in ((tr + math.sqrt(disc)) / 2, (tr - math.sqrt(disc)) / 2):
        v = (b, lam - a) if b != 0 else ((lam - d, c) if c != 0 else ((1, 0) if a == lam else (0, 1)))
        n = math.hypot(*v)
        out.append((lam, (v[0] / n, v[1] / n)))
    return out


for M in ([2, 1, 1, 2], [4, 1, 2, 3], [0, -1, 1, 0]):
    a, b, c, d = M
    res = eigen2(a, b, c, d)
    print(f"A = [[{a}, {b}], [{c}, {d}]]")
    if res is None:
        print("  no real eigenvalues")
        continue
    for lam, (x, y) in res:
        ax, ay = a * x + b * y, c * x + d * y
        print(f"  lambda = {lam:.4f}  v = ({x:.4f}, {y:.4f})  Av = ({ax:.4f}, {ay:.4f})  ok = {abs(ax - lam * x) < 1e-9 and abs(ay - lam * y) < 1e-9}")
