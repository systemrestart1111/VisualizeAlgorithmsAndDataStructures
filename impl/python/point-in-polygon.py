POLY = [(2, 1), (9, 2), (11, 7), (7, 5), (5, 10), (1, 7)]


def inside(pt, poly):
    """射線法：從點往右射一條水平線，與多邊形的邊相交奇數次就在內部"""
    x, y = pt
    res = False
    for i in range(len(poly)):
        (x1, y1), (x2, y2) = poly[i], poly[(i + 1) % len(poly)]
        if (y1 > y) != (y2 > y):  # 這條邊跨過水平線
            # 交點 x 座標 > x 才算在右側；改寫成乘法以避免除法誤差
            v = (x2 - x1) * (y - y1) - (x - x1) * (y2 - y1)
            if (v > 0) if y2 > y1 else (v < 0):
                res = not res
    return res


for q in [(5, 4), (8, 7), (3, 8), (10, 3)]:
    print(f"({q[0]},{q[1]}):", "inside" if inside(q, POLY) else "outside")
