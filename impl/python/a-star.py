import heapq

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


def h(p):  # 曼哈頓距離：在只能上下左右移動的格子上不會高估，因此 A* 保證最短
    return abs(p[0] - E[0]) + abs(p[1] - E[1])


def a_star():
    """依 f = g + h 由小到大展開（同分時比 h，再比座標）"""
    g, parent, closed = {S: 0}, {S: None}, set()
    heap = [(h(S), h(S), S)]
    expanded = 0
    while heap:
        _, _, u = heapq.heappop(heap)
        if u in closed:
            continue
        closed.add(u)
        expanded += 1
        if u == E:
            break
        for dr, dc in DIRS:
            v = (u[0] + dr, u[1] + dc)
            if 0 <= v[0] < R and 0 <= v[1] < C and GRID[v[0]][v[1]] != "#" and g[u] + 1 < g.get(v, float("inf")):
                g[v], parent[v] = g[u] + 1, u
                heapq.heappush(heap, (g[v] + h(v), h(v), v))
    return g.get(E), expanded, parent


length, expanded, parent = a_star()
print("path length =", length, "expanded =", expanded)
rows = [list(row) for row in GRID]
p = parent[E]
while p != S:
    rows[p[0]][p[1]] = "*"
    p = parent[p]
print("\n".join("".join(r) for r in rows))
