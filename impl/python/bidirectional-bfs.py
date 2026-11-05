GRID = ["S.....#.........",
        ".####.#.#######.",
        ".#....#.......#.",
        ".#.#######.##.#.",
        ".#..........#...",
        ".#######.#.###.#",
        ".........#...#..",
        "########.####.#.",
        "..............#E"]
R, C = len(GRID), len(GRID[0])
S = next((r, c) for r in range(R) for c in range(C) if GRID[r][c] == "S")
E = next((r, c) for r in range(R) for c in range(C) if GRID[r][c] == "E")
DIRS = [(0, 1), (1, 0), (0, -1), (-1, 0)]


def neighbors(u):
    for dr, dc in DIRS:
        v = (u[0] + dr, u[1] + dc)
        if 0 <= v[0] < R and 0 <= v[1] < C and GRID[v[0]][v[1]] != "#":
            yield v


def expand(frontier, dist, other):
    """把一側展開一整層；若碰到另一側已拜訪的格子，記下最短的接合點"""
    nxt, best = [], None
    for u in frontier:
        for v in neighbors(u):
            if v in other:
                cand = dist[u] + 1 + other[v]
                if best is None or cand < best[0]:
                    best = (cand, v)
            if v not in dist:
                dist[v] = dist[u] + 1
                nxt.append(v)
    return nxt, best


def bidirectional_bfs():
    """從起點與終點同時做 BFS，每次展開較小的那一側；兩邊相遇時即得最短路徑"""
    ds, de = {S: 0}, {E: 0}
    fs, fe = [S], [E]
    while fs and fe:
        if len(fs) <= len(fe):
            fs, best = expand(fs, ds, de)
        else:
            fe, best = expand(fe, de, ds)
        if best:
            return best[0], best[1], len(ds) + len(de)
    return None, None, len(ds) + len(de)


length, meet, visited = bidirectional_bfs()
print("path length =", length)
print("meet at", meet)
print("visited cells =", visited)
