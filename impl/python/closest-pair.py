import math

PTS = [(2, 3), (12, 30), (40, 50), (5, 1), (12, 10), (3, 4), (25, 18), (33, 8), (18, 25), (45, 22), (8, 40), (30, 35), (22, 5)]


def d2(a, b):
    return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2


def closest(p):
    """分治：左右兩半各自求解，再檢查跨中線、寬度 < d 的帶狀區域（每點只需比較常數個鄰居）"""
    if len(p) <= 3:
        best = (float("inf"), None)
        for i in range(len(p)):
            for j in range(i + 1, len(p)):
                if d2(p[i], p[j]) < best[0]:
                    best = (d2(p[i], p[j]), (p[i], p[j]))
        return best
    mid = len(p) // 2
    mx = p[mid][0]
    left, right = closest(p[:mid]), closest(p[mid:])
    best = left if left[0] <= right[0] else right
    strip = sorted((q for q in p if (q[0] - mx) ** 2 < best[0]), key=lambda q: (q[1], q[0]))
    for i in range(len(strip)):
        for j in range(i + 1, len(strip)):
            if (strip[j][1] - strip[i][1]) ** 2 >= best[0]:
                break
            if d2(strip[i], strip[j]) < best[0]:
                best = (d2(strip[i], strip[j]), (strip[i], strip[j]))
    return best


dist2, (a, b) = closest(sorted(PTS))
a, b = sorted([a, b])
print(f"closest pair: ({a[0]},{a[1]}) ({b[0]},{b[1]})")
print(f"distance = {math.sqrt(dist2):.4f}")
print("brute force d^2 =", min(d2(PTS[i], PTS[j]) for i in range(len(PTS)) for j in range(i + 1, len(PTS))))
