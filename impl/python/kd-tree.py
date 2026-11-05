import math


class KD:
    def __init__(self, p, axis):
        self.p, self.axis, self.left, self.right = p, axis, None, None


def build(pts, depth=0):
    """交替以 x、y 的中位數切分"""
    if not pts:
        return None
    axis = depth % 2
    s = sorted(pts, key=lambda q: (q[axis], q[1 - axis]))
    m = len(s) // 2
    n = KD(s[m], axis)
    n.left, n.right = build(s[:m], depth + 1), build(s[m + 1:], depth + 1)
    return n


def nearest(root, q):
    """先走查詢點所在的一側；到切分線的距離小於目前最近距離才檢查另一側"""
    best, bd, visited = None, float("inf"), 0

    def go(n):
        nonlocal best, bd, visited
        if n is None:
            return
        visited += 1
        d = (n.p[0] - q[0]) ** 2 + (n.p[1] - q[1]) ** 2
        if d < bd:
            best, bd = n.p, d
        diff = q[n.axis] - n.p[n.axis]
        near, far = (n.left, n.right) if diff < 0 else (n.right, n.left)
        go(near)
        if diff * diff < bd:
            go(far)

    go(root)
    return best, bd, visited


pts = [(30, 40), (5, 25), (70, 70), (10, 12), (50, 30), (35, 45), (80, 15), (60, 85), (20, 75), (90, 55), (45, 60)]
root = build(pts)
print("root:", root.p, "| left:", root.left.p, "| right:", root.right.p)
for q in [(52, 52), (12, 20), (95, 95), (0, 100)]:
    b, d2, v = nearest(root, q)
    brute = min((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 for p in pts)
    print(f"nearest to {q}: {b} dist {math.sqrt(d2):.2f} visited {v}/{len(pts)} brute {math.sqrt(brute):.2f}")
