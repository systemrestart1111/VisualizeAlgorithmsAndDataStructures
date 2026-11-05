PTS = [(3, 1), (7, 2), (10, 5), (6, 4), (2, 6), (5, 7), (8, 9), (1, 3), (4, 4), (9, 7), (6, 10), (3, 9), (7, 6)]


def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def jarvis_march(pts):
    """禮物包裝法：從最左點出發，每次找「所有點都在它左側」的下一個點，O(nh)"""
    start = min(pts)
    hull, p = [], start
    while True:
        hull.append(p)
        q = pts[0] if pts[0] != p else pts[1]
        for r in pts:
            c = cross(p, q, r)
            far = (r[0] - p[0]) ** 2 + (r[1] - p[1]) ** 2 > (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2
            if c < 0 or (c == 0 and far):  # r 在 p→q 右側，或共線但更遠
                q = r
        p = q
        if p == start:
            return hull


print("hull (counter-clockwise):", " ".join(f"({x},{y})" for x, y in jarvis_march(PTS)))
