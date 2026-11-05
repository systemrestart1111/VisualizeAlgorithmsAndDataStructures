from functools import cmp_to_key

PTS = [(3, 1), (7, 2), (10, 5), (6, 4), (2, 6), (5, 7), (8, 9), (1, 3), (4, 4), (9, 7), (6, 10), (3, 9), (7, 6)]


def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def graham_scan(pts):
    """以最低點為基準依極角排序，依序加入；若形成右轉（非逆時針）就把堆疊頂端彈出"""
    p0 = min(pts, key=lambda p: (p[1], p[0]))

    def by_angle(a, b):
        c = cross(p0, a, b)
        if c:
            return -1 if c > 0 else 1
        da = (a[0] - p0[0]) ** 2 + (a[1] - p0[1]) ** 2
        db = (b[0] - p0[0]) ** 2 + (b[1] - p0[1]) ** 2
        return da - db  # 共線時近的在前

    rest = sorted([p for p in pts if p != p0], key=cmp_to_key(by_angle))
    stack = [p0]
    for p in rest:
        while len(stack) >= 2 and cross(stack[-2], stack[-1], p) <= 0:
            stack.pop()
        stack.append(p)
    return stack


print("hull (counter-clockwise):", " ".join(f"({x},{y})" for x, y in graham_scan(PTS)))
