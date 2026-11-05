PTS = [(3, 1), (7, 2), (10, 5), (6, 4), (2, 6), (5, 7), (8, 9), (1, 3), (4, 4), (9, 7), (6, 10), (3, 9), (7, 6)]


def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def monotone_chain(pts):
    """依 (x, y) 排序後，左到右建下凸殼、右到左建上凸殼，兩者接起來就是凸包（不需算角度）"""
    pts = sorted(pts)
    lower, upper = [], []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]


print("hull (counter-clockwise):", " ".join(f"({x},{y})" for x, y in monotone_chain(PTS)))
