from math import gcd


def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def touch(a, b, c, d):
    """閉線段是否相交（含端點接觸）"""
    d1, d2, d3, d4 = cross(c, d, a), cross(c, d, b), cross(a, b, c), cross(a, b, d)
    if ((d1 > 0) != (d2 > 0)) and d1 and d2 and ((d3 > 0) != (d4 > 0)) and d3 and d4:
        return True
    on = lambda p, q, x: min(p[0], q[0]) <= x[0] <= max(p[0], q[0]) and min(p[1], q[1]) <= x[1] <= max(p[1], q[1])
    return (d1 == 0 and on(c, d, a)) or (d2 == 0 and on(c, d, b)) or (d3 == 0 and on(a, b, c)) or (d4 == 0 and on(a, b, d))


def is_simple(P):
    n = len(P)
    for i in range(n):
        for j in range(i + 1, n):
            if j == i + 1 or (i == 0 and j == n - 1):
                continue
            if touch(P[i], P[(i + 1) % n], P[j], P[(j + 1) % n]):
                return False
    return True


def shoelace(P):
    """S = Σ (xᵢ·yᵢ₊₁ − xᵢ₊₁·yᵢ)；有向面積 S/2，正為逆時針"""
    s = 0
    for i in range(len(P)):
        j = (i + 1) % len(P)
        s += P[i][0] * P[j][1] - P[j][0] * P[i][1]
    return s / 2


polys = [
    [(1, 1), (7, 2), (9, 6), (5, 9), (4, 5), (1, 7)],
    [(1, 7), (4, 5), (5, 9), (9, 6), (7, 2), (1, 1)],
    [(0, 0), (6, 0), (6, 4), (3, 2), (0, 4)],
    [(0, 0), (8, 6), (8, 0), (0, 6)],
]
for P in polys:
    A = shoelace(P)
    if not is_simple(P):
        print(f"signed area {A:.1f}, but polygon is not simple: result is not its area")
        continue
    B = sum(gcd(abs(P[(i + 1) % len(P)][0] - P[i][0]), abs(P[(i + 1) % len(P)][1] - P[i][1])) for i in range(len(P)))
    I = abs(A) - B / 2 + 1
    print(f"signed area {A:.1f} ({'counter-clockwise' if A > 0 else 'clockwise'}), area {abs(A):.1f}, Pick: B = {B}, I = {I:.0f}")
