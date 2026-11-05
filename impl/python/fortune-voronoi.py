import math

INF = float("inf")


def circum(a, b, c):
    d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]))
    if abs(d) < 1e-12:
        return None
    A, B, C = a[0] ** 2 + a[1] ** 2, b[0] ** 2 + b[1] ** 2, c[0] ** 2 + c[1] ** 2
    ux = (A * (b[1] - c[1]) + B * (c[1] - a[1]) + C * (a[1] - b[1])) / d
    uy = (A * (c[0] - b[0]) + B * (a[0] - c[0]) + C * (b[0] - a[0])) / d
    return ux, uy, math.hypot(a[0] - ux, a[1] - uy)


def parab(s, L, x):
    """焦點 s、準線 y = L 的拋物線在 x 的高度"""
    return INF if abs(s[1] - L) < 1e-12 else ((x - s[0]) ** 2 + s[1] ** 2 - L * L) / (2 * (s[1] - L))


def break_x(a, b, L):
    """左弧 a 與右弧 b 的斷點：兩拋物線的交點中，左邊由 a 較低的那一個"""
    da, db = 2 * (a[1] - L), 2 * (b[1] - L)
    if abs(da) < 1e-12:
        return a[0]
    if abs(db) < 1e-12:
        return b[0]
    A = 1 / da - 1 / db
    B = -2 * (a[0] / da - b[0] / db)
    C = (a[0] ** 2 + a[1] ** 2 - L * L) / da - (b[0] ** 2 + b[1] ** 2 - L * L) / db
    if abs(A) < 1e-12:
        return -C / B
    disc = math.sqrt(max(0.0, B * B - 4 * A * C))
    roots = [(-B - disc) / (2 * A), (-B + disc) / (2 * A)]
    eps = 1e-6 * (1 + abs(roots[0]) + abs(roots[1]))
    for x in roots:
        if parab(a, L, x - eps) < parab(b, L, x - eps):
            return x
    return roots[0]


class Arc:
    def __init__(self, site):
        self.site, self.ev = site, None


def fortune(S):
    """掃描線由上往下；站點事件切開弧，圓事件讓弧消失並產生 Voronoi 頂點"""
    xs = [p[0] for p in S]
    scale = max(xs) - min(xs) + 6
    beach = []
    Q = [{"y": p[1], "site": i, "valid": True} for i, p in enumerate(S)]
    verts = []
    L = max(p[1] for p in S) + 3

    def check(k):
        if k < 1 or k + 1 >= len(beach) or beach[k - 1].site == beach[k + 1].site:
            return
        a, b, c = S[beach[k - 1].site], S[beach[k].site], S[beach[k + 1].site]
        cc = circum(a, b, c)
        if cc is None:
            return
        yb = cc[1] - cc[2]
        if yb > L + 1e-9:
            return
        tol = 1e-5 * scale
        if abs(break_x(a, b, yb) - cc[0]) > tol or abs(break_x(b, c, yb) - cc[0]) > tol:
            return
        ev = {"y": yb, "arc": beach[k], "c": cc, "valid": True}
        beach[k].ev = ev
        Q.append(ev)

    def kill(arc):
        if arc.ev is not None:
            arc.ev["valid"] = False
        arc.ev = None

    while Q:
        Q.sort(key=lambda e: (-e["y"], 0 if "site" in e else 1))
        e = Q.pop(0)
        if not e["valid"]:
            continue
        L = e["y"]
        if "site" in e:
            p = e["site"]
            if not beach:
                beach.append(Arc(p))
                continue
            k = 0
            while k + 1 < len(beach) and break_x(S[beach[k].site], S[beach[k + 1].site], L) < S[p][0]:
                k += 1
            old = beach[k]
            kill(old)
            beach[k:k + 1] = [Arc(old.site), Arc(p), Arc(old.site)]
            check(k)
            check(k + 2)
        else:
            arc = e["arc"]
            if arc not in beach:
                continue
            k = beach.index(arc)
            if k < 1 or k + 1 >= len(beach):
                continue
            verts.append((e["c"][0], e["c"][1]))
            del beach[k]
            kill(beach[k - 1])
            kill(beach[k])
            check(k - 1)
            check(k)
    uniq = []
    for v in verts:
        if all(math.hypot(v[0] - w[0], v[1] - w[1]) > 1e-6 for w in uniq):
            uniq.append(v)
    return sorted(uniq)


def brute(S):
    """暴力：外接圓內沒有其他站點的三點組，圓心就是 Voronoi 頂點"""
    out = []
    n = len(S)
    for i in range(n):
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                cc = circum(S[i], S[j], S[k])
                if cc and all(math.hypot(s[0] - cc[0], s[1] - cc[1]) >= cc[2] - 1e-7 for s in S):
                    if all(math.hypot(cc[0] - w[0], cc[1] - w[1]) > 1e-6 for w in out):
                        out.append((cc[0], cc[1]))
    return sorted(out)


def f3(v):
    return f"{0.0 if abs(v) < 5e-4 else v:.3f}"


seed = 11
def rnd():
    global seed
    seed = seed * 48271 % 2147483647
    return seed


tests = [
    [(3, 3), (12, 4), (7, 9), (2, 13), (15, 12), (10, 16), (17, 7)],
    [(rnd() % 100000 / 5000, rnd() % 100000 / 5000) for _ in range(12)],
    [(0, 0), (10, 1), (5, 9)],
]
for S in tests:
    v, b = fortune(S), brute(S)
    same = len(v) == len(b) and all(math.hypot(p[0] - q[0], p[1] - q[1]) < 1e-6 for p, q in zip(v, b))
    print(f"{len(S)} sites: {len(v)} Voronoi vertices (brute force agrees {same})")
    print("  " + " ".join(f"({f3(x)}, {f3(y)})" for x, y in v))
