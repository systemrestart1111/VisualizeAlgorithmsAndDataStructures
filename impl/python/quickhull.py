def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def quickhull(raw):
    """最左、最右點必在凸包上；遞迴找離線段最遠的點，三角形內的點丟掉"""
    S = []
    for p in raw:
        if p not in S:
            S.append(p)
    if len(S) < 3:
        return S
    A = min(range(len(S)), key=lambda i: (S[i][0], S[i][1]))
    B = max(range(len(S)), key=lambda i: (S[i][0], S[i][1]))

    def find(pts, p, q):
        if not pts:
            return []
        f = pts[0]
        for i in pts:
            if cross(S[p], S[q], S[i]) > cross(S[p], S[q], S[f]) + 1e-12:
                f = i
        s1 = [i for i in pts if cross(S[p], S[f], S[i]) > 1e-9]
        s2 = [i for i in pts if cross(S[f], S[q], S[i]) > 1e-9]
        return find(s1, p, f) + [f] + find(s2, f, q)

    rest = [i for i in range(len(S)) if i not in (A, B)]
    up = find([i for i in rest if cross(S[A], S[B], S[i]) > 1e-9], A, B)
    down = find([i for i in rest if cross(S[A], S[B], S[i]) < -1e-9], B, A)
    cw = [A] + up + [B] + down
    return [S[i] for i in [cw[0]] + cw[1:][::-1]]


def monotone(S):
    p = sorted(set(S))
    if len(p) < 3:
        return p
    lo, up = [], []
    for q in p:
        while len(lo) >= 2 and cross(lo[-2], lo[-1], q) <= 1e-9:
            lo.pop()
        lo.append(q)
    for q in reversed(p):
        while len(up) >= 2 and cross(up[-2], up[-1], q) <= 1e-9:
            up.pop()
        up.append(q)
    return lo[:-1] + up[:-1]


s = 7
def rnd(n):
    global s
    s = s * 48271 % 2147483647
    return s % n


tests = [
    [(3, 1), (7, 2), (10, 5), (6, 4), (2, 6), (5, 7), (8, 9), (1, 3), (4, 4), (9, 7), (6, 10), (3, 9), (7, 6), (5, 5)],
    [(0, 0), (4, 0), (4, 4), (0, 4), (2, 0), (2, 2), (4, 2), (0, 0), (0, 2)],
    [(rnd(100), rnd(100)) for _ in range(30)],
]
for S in tests:
    h = quickhull(S)
    print(f"hull ({len(h)}): " + " ".join(f"({x},{y})" for x, y in h) + f"; same as monotone chain {sorted(h) == sorted(monotone(S))}")
