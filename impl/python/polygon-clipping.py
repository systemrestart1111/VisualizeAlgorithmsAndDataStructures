SUBJ = [(1, 4), (5, 11), (9, 6), (13, 10), (12, 2), (6, 0)]
CLIP = [(3, 2), (11, 2), (11, 8), (3, 8)]  # 凸多邊形，逆時針


def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def intersect(p, q, a, b):
    """線段 pq 與直線 ab 的交點"""
    t = cross(a, b, p) / (cross(a, b, p) - cross(a, b, q))
    return (p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t)


def clip(subject, window):
    """Sutherland–Hodgman：依序用裁切窗的每一條邊去裁多邊形，只保留在邊左側（內側）的部分"""
    out = subject
    for i in range(len(window)):
        a, b = window[i], window[(i + 1) % len(window)]
        inp, out = out, []
        for k in range(len(inp)):
            p, q = inp[k], inp[(k + 1) % len(inp)]
            pin, qin = cross(a, b, p) >= 0, cross(a, b, q) >= 0
            if pin and qin:
                out.append(q)
            elif pin and not qin:
                out.append(intersect(p, q, a, b))
            elif not pin and qin:
                out.append(intersect(p, q, a, b))
                out.append(q)
    return out


res = clip(SUBJ, CLIP)
print("clipped polygon:", len(res), "vertices")
for x, y in res:
    print(f"  ({x:.4f}, {y:.4f})")
