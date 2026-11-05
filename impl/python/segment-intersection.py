def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def on_segment(p, q, r):
    """已知 p、q、r 共線：r 是否落在 pq 的範圍內"""
    return min(p[0], q[0]) <= r[0] <= max(p[0], q[0]) and min(p[1], q[1]) <= r[1] <= max(p[1], q[1])


def intersect(p1, p2, p3, p4):
    """兩條線段互相「跨立」（各自的兩端點分別在另一條線的兩側），或端點恰好落在另一條線段上"""
    d1, d2 = cross(p3, p4, p1), cross(p3, p4, p2)
    d3, d4 = cross(p1, p2, p3), cross(p1, p2, p4)
    if ((d1 > 0) != (d2 > 0)) and d1 and d2 and ((d3 > 0) != (d4 > 0)) and d3 and d4:
        return True
    return (d1 == 0 and on_segment(p3, p4, p1)) or (d2 == 0 and on_segment(p3, p4, p2)) or \
           (d3 == 0 and on_segment(p1, p2, p3)) or (d4 == 0 and on_segment(p1, p2, p4))


SEGS = [(1, 1, 9, 7, 2, 8, 8, 2), (1, 1, 4, 4, 5, 5, 9, 2), (2, 2, 8, 2, 5, 2, 5, 7), (1, 6, 4, 9, 6, 1, 9, 4)]
for s in SEGS:
    p = [(s[i], s[i + 1]) for i in range(0, 8, 2)]
    print(f"({s[0]},{s[1]})-({s[2]},{s[3]}) vs ({s[4]},{s[5]})-({s[6]},{s[7]}):", "intersect" if intersect(*p) else "no")
