SITES = [(3, 3), (12, 4), (7, 9), (2, 13), (15, 12), (10, 16), (17, 7)]
xs, ys = [p[0] for p in SITES], [p[1] for p in SITES]
BOX = [(min(xs) - 3, min(ys) - 3), (max(xs) + 3, min(ys) - 3), (max(xs) + 3, max(ys) + 3), (min(xs) - 3, max(ys) + 3)]


def clip_halfplane(poly, a, b, c):
    """保留滿足 a·x + b·y <= c 的部分（凸多邊形與半平面的交集）"""
    out = []
    for k in range(len(poly)):
        p, q = poly[k], poly[(k + 1) % len(poly)]
        fp, fq = a * p[0] + b * p[1] - c, a * q[0] + b * q[1] - c
        if fp <= 0:
            out.append(p)
        if (fp < 0 < fq) or (fq < 0 < fp):
            t = fp / (fp - fq)
            out.append((p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t))
    return out


def area(poly):
    return abs(sum(poly[i][0] * poly[(i + 1) % len(poly)][1] - poly[(i + 1) % len(poly)][0] * poly[i][1] for i in range(len(poly)))) / 2


# 站點 i 的 Voronoi 區域 = 外框依序被「比站點 j 更靠近站點 i」的半平面（垂直平分線的一側）裁切後剩下的部分
total = 0.0
for i, (sx, sy) in enumerate(SITES):
    cell = BOX
    for j, (tx, ty) in enumerate(SITES):
        if i != j:
            # |P - S|² <= |P - T|²  <=>  2(T - S)·P <= |T|² - |S|²
            cell = clip_halfplane(cell, 2 * (tx - sx), 2 * (ty - sy), tx * tx + ty * ty - sx * sx - sy * sy)
    total += area(cell)
    print(f"site {i} ({sx},{sy}): {len(cell)} vertices, area = {area(cell):.4f}")
print(f"sum of areas = {total:.4f} (box area = {(BOX[1][0] - BOX[0][0]) * (BOX[2][1] - BOX[1][1])})")
