GRID = ["S..#....",
        ".#.#.##.",
        ".#...#..",
        ".####.#.",
        "......#E"]
R, C = len(GRID), len(GRID[0])
S, E = (0, 0), (4, 7)
DIRS = [(0, 1), (1, 0), (0, -1), (-1, 0)]
FOUND = -1


def h(p):
    return abs(p[0] - E[0]) + abs(p[1] - E[1])


def search(path, g, bound):
    """深度優先，但 f = g + h 超過門檻就剪掉；回傳被剪掉的最小 f 作為下一輪門檻"""
    u = path[-1]
    f = g + h(u)
    if f > bound:
        return f
    if u == E:
        return FOUND
    mn = float("inf")
    for dr, dc in DIRS:
        v = (u[0] + dr, u[1] + dc)
        if 0 <= v[0] < R and 0 <= v[1] < C and GRID[v[0]][v[1]] != "#" and v not in path:
            path.append(v)
            t = search(path, g + 1, bound)
            if t == FOUND:
                return FOUND
            mn = min(mn, t)
            path.pop()
    return mn


def ida_star():
    """疊代加深：門檻從 h(S) 開始，每輪提高到上一輪被剪掉的最小 f，記憶體只需 O(路徑長)"""
    bound, path, bounds = h(S), [S], []
    while True:
        bounds.append(bound)
        t = search(path, 0, bound)
        if t == FOUND:
            return path, bounds
        if t == float("inf"):
            return None, bounds
        bound = t


path, bounds = ida_star()
print("bounds:", *bounds)
print("path length =", len(path) - 1)
rows = [list(r) for r in GRID]
for r, c in path[1:-1]:
    rows[r][c] = "*"
print("\n".join("".join(r) for r in rows))
