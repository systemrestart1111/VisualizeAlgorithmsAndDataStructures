def seg_x(s, t):
    (x1, y1), (x2, y2) = s
    (x3, y3), (x4, y4) = t
    d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3)
    if abs(d) < 1e-12:
        return None
    u = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d
    v = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d
    if u < -1e-9 or u > 1 + 1e-9 or v < -1e-9 or v > 1 + 1e-9:
        return None
    return (x1 + u * (x2 - x1), y1 + u * (y2 - y1))


def key(p):
    return (round(p[0] * 1e6), round(p[1] * 1e6))


def bentley_ottmann(raw):
    """掃描線由左往右；只檢查 status 中新相鄰的一對；同點多線只回報一次"""
    L = [((x1, y1), (x2, y2)) if x1 < x2 else ((x2, y2), (x1, y1)) for x1, y1, x2, y2 in raw]
    y_at = lambda s, x: s[0][1] + (s[1][1] - s[0][1]) * (x - s[0][0]) / (s[1][0] - s[0][0])
    xs = [p[0] for s in L for p in s]
    delta = (max(xs) - min(xs) + 2) * 1e-7
    rank = {0: 1, 1: 0, 2: 2}
    Q = [(s[0][0], s[0][1], 0, i) for i, s in enumerate(L)] + [(s[1][0], s[1][1], 2, i) for i, s in enumerate(L)]
    sort_q = lambda: Q.sort(key=lambda e: (e[0], e[1], rank[e[2]]))
    sort_q()
    status, queued, found = [], set(), []

    def pairs():
        return {(min(a, b), max(a, b)) for a, b in zip(status, status[1:])}

    def check(x, y, before):
        for a, b in zip(status, status[1:]):
            if (min(a, b), max(a, b)) in before:
                continue
            p = seg_x(L[a], L[b])
            if p is None or p[0] < x - 1e-9 or (abs(p[0] - x) <= 1e-9 and p[1] < y - 1e-9):
                continue
            if key(p) in queued:
                continue
            queued.add(key(p))
            Q.append((p[0], p[1], 1, -1))
        sort_q()

    while Q:
        x, y, kind, s = Q.pop(0)
        before = pairs()
        if kind == 0:
            status.append(s)
            status.sort(key=lambda i: y_at(L[i], x + delta))
        elif kind == 2:
            status.remove(s)
        else:
            through = [i for i, t in enumerate(L) if t[0][0] - 1e-9 <= x <= t[1][0] + 1e-9 and abs(y_at(t, x) - y) < 1e-7]
            found.append(((x, y), through))
            status.sort(key=lambda i: y_at(L[i], x + delta))
        check(x, y, before)
    brute = {key(p) for i in range(len(L)) for j in range(i + 1, len(L)) for p in [seg_x(L[i], L[j])] if p}
    return found, brute == {key(p) for p, _ in found}


def f3(v):
    return f"{0.0 if abs(v) < 5e-4 else v:.3f}"


tests = [
    [(1, 2, 9, 8), (1, 7, 8, 1), (3, 1, 10, 6), (2, 9, 11, 3), (4, 5, 12, 5), (6, 8, 12, 9)],
    [(0, 0, 10, 10), (0, 10, 10, 0), (0, 5, 10, 5), (2, 8, 4, 9)],
    [(0, 0, 5, 5), (5, 5, 10, 0), (1, 4, 9, 4)],
]
for segs in tests:
    found, ok = bentley_ottmann(segs)
    found.sort(key=lambda f: (f[0][0], f[0][1]))
    print(f"{len(found)} intersections (brute force agrees {ok})")
    for p, through in found:
        print(f"  ({f3(p[0])}, {f3(p[1])}): segments {' '.join(map(str, through))}")
