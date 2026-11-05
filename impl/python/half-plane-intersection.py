import math


def hpi(cons):
    """每個 a·x + b·y ≤ c 轉成有向線（可行側在左），加大方框，依角度排序後用雙端佇列"""
    H = []
    for a, b, c in cons:
        n2 = a * a + b * b
        H.append(((a * c / n2, b * c / n2), (-b, a), False))
    M = max([50.0] + [abs(c) / math.hypot(a, b) for a, b, c in cons]) * 4
    H += [((M, -M), (0, 1), True), ((M, M), (-1, 0), True), ((-M, M), (0, -1), True), ((-M, -M), (1, 0), True)]
    H.sort(key=lambda h: math.atan2(h[1][1], h[1][0]))
    out = lambda h, x: h[1][0] * (x[1] - h[0][1]) - h[1][1] * (x[0] - h[0][0]) < -1e-9

    def inter(s, t):
        al = ((t[0][0] - s[0][0]) * t[1][1] - (t[0][1] - s[0][1]) * t[1][0]) / (s[1][0] * t[1][1] - s[1][1] * t[1][0])
        return (s[0][0] + s[1][0] * al, s[0][1] + s[1][1] * al)

    dq = []
    for h in H:
        while len(dq) >= 2 and out(h, inter(dq[-1], dq[-2])):
            dq.pop()
        while len(dq) >= 2 and out(h, inter(dq[0], dq[1])):
            dq.pop(0)
        if dq and abs(h[1][0] * dq[-1][1][1] - h[1][1] * dq[-1][1][0]) < 1e-12:
            if h[1][0] * dq[-1][1][0] + h[1][1] * dq[-1][1][1] < 0:
                return None, False
            if out(h, dq[-1][0]):
                dq.pop()
            else:
                continue
        dq.append(h)
    while len(dq) >= 3 and out(dq[0], inter(dq[-1], dq[-2])):
        dq.pop()
    while len(dq) >= 3 and out(dq[-1], inter(dq[0], dq[1])):
        dq.pop(0)
    if len(dq) < 3:
        return None, False
    poly = []
    for i in range(len(dq)):
        p = inter(dq[i], dq[(i + 1) % len(dq)])
        if not poly or math.hypot(p[0] - poly[-1][0], p[1] - poly[-1][1]) > 1e-9:
            poly.append(p)
    if len(poly) > 1 and math.hypot(poly[0][0] - poly[-1][0], poly[0][1] - poly[-1][1]) <= 1e-9:
        poly.pop()
    return poly, any(h[2] for h in dq)


def f3(v):
    return f"{0.0 if abs(v) < 5e-4 else v:.3f}"


for cons in [[(1, 1, 10), (-1, 0, 0), (0, -1, 0), (1, -2, 4), (-2, 1, 6), (1, 0, 7)],
             [(1, 0, 2), (-1, 0, -5), (0, 1, 5), (0, -1, 0)],
             [(1, 1, 4), (1, -1, 2), (-1, 0, 1), (1, 1, 6)],
             [(-1, 0, 0), (0, -1, 0)]]:
    poly, boxed = hpi(cons)
    if poly is None:
        print("empty intersection")
        continue
    s = min(range(len(poly)), key=lambda i: (round(poly[i][0], 6), round(poly[i][1], 6)))
    poly = poly[s:] + poly[:s]
    area = abs(sum(poly[i][0] * poly[(i + 1) % len(poly)][1] - poly[(i + 1) % len(poly)][0] * poly[i][1] for i in range(len(poly)))) / 2
    if boxed:
        print(f"unbounded: clipped by the bounding box ({len(poly)} vertices)")
    else:
        print(f"{len(poly)}-gon, area {f3(area)}: " + " ".join(f"({f3(x)}, {f3(y)})" for x, y in poly))
