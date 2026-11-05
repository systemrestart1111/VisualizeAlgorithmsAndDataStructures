PTS = [(3, 3), (12, 4), (7, 9), (2, 13), (15, 12), (10, 16), (17, 7), (8, 2), (5, 6)]
n = len(PTS)
P = PTS + [(-1000, -1000), (1000, -1000), (0, 1000)]  # 最後三點是包住所有點的超級三角形


def orient(a, b, c):
    return (P[b][0] - P[a][0]) * (P[c][1] - P[a][1]) - (P[b][1] - P[a][1]) * (P[c][0] - P[a][0])


def in_circumcircle(t, d):
    """點 d 是否在三角形 t 的外接圓內（整數行列式，沒有浮點誤差）"""
    a, b, c = t
    if orient(a, b, c) < 0:
        b, c = c, b  # 調整成逆時針
    m = [(P[v][0] - P[d][0], P[v][1] - P[d][1]) for v in (a, b, c)]
    rows = [(x, y, x * x + y * y) for x, y in m]
    det = (rows[0][0] * (rows[1][1] * rows[2][2] - rows[2][1] * rows[1][2])
           - rows[0][1] * (rows[1][0] * rows[2][2] - rows[2][0] * rows[1][2])
           + rows[0][2] * (rows[1][0] * rows[2][1] - rows[2][0] * rows[1][1]))
    return det > 0


# Bowyer–Watson：逐一加入點；刪掉外接圓包含新點的三角形，留下的多邊形空洞再與新點連成三角形
tris = [(n, n + 1, n + 2)]
for p in range(n):
    bad = [t for t in tris if in_circumcircle(t, p)]
    count = {}
    for t in bad:
        for e in ((t[0], t[1]), (t[1], t[2]), (t[2], t[0])):
            key = tuple(sorted(e))
            count[key] = count.get(key, 0) + 1
    tris = [t for t in tris if t not in bad]
    tris += [(u, v, p) for (u, v), c in count.items() if c == 1]  # 只出現一次的邊是空洞的邊界

result = sorted(tuple(sorted(t)) for t in tris if max(t) < n)  # 去掉碰到超級三角形的三角形
print("triangles:", len(result))
for t in result:
    print(" ", t, " ".join(f"({P[v][0]},{P[v][1]})" for v in t))
