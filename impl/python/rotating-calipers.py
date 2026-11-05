import math

PTS = [(3, 1), (7, 2), (10, 5), (6, 4), (2, 6), (5, 7), (8, 9), (1, 3), (4, 4), (9, 7), (6, 10), (3, 9), (7, 6)]


def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def d2(a, b):
    return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2


def convex_hull(pts):
    pts = sorted(pts)
    h = []
    for seq in (pts, pts[::-1]):
        start = len(h)
        for p in seq:
            while len(h) >= start + 2 and cross(h[-2], h[-1], p) <= 0:
                h.pop()
            h.append(p)
        h.pop()
    return h


def diameter(h):
    """旋轉卡尺：沿凸包每條邊，把對面的「最遠點」指標 j 單調往前推；最遠點對一定是某組對蹠點"""
    n, j = len(h), 1
    best = (0, None)
    for i in range(n):
        ni = (i + 1) % n
        while abs(cross(h[i], h[ni], h[(j + 1) % n])) > abs(cross(h[i], h[ni], h[j])):
            j = (j + 1) % n
        for a in (h[i], h[ni]):
            if d2(a, h[j]) > best[0]:
                best = (d2(a, h[j]), (a, h[j]))
    return best


hull = convex_hull(PTS)
dist2, (a, b) = diameter(hull)
print("hull:", " ".join(f"({x},{y})" for x, y in hull))
print(f"farthest pair: ({a[0]},{a[1]}) ({b[0]},{b[1]}), distance = {math.sqrt(dist2):.4f}")
print("brute force d^2 =", max(d2(p, q) for p in PTS for q in PTS))
