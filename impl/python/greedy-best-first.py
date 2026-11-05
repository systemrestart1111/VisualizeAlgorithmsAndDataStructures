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


def h(p):
    return abs(p[0] - E[0]) + abs(p[1] - E[1])


def greedy_best_first():
    """只看 h（離終點多近）來決定下一步：通常很快，但不保證最短路徑"""
    parent = {S: None}
    heap = [(h(S), S)]
    expanded = 0
    while heap:
        _, u = heapq.heappop(heap)
        expanded += 1
        if u == E:
            break
        for dr, dc in DIRS:
            v = (u[0] + dr, u[1] + dc)
            if 0 <= v[0] < R and 0 <= v[1] < C and GRID[v[0]][v[1]] != "#" and v not in parent:
                parent[v] = u
                heapq.heappush(heap, (h(v), v))
    return expanded, parent


expanded, parent = greedy_best_first()
rows = [list(row) for row in GRID]
length, p = 1, parent[E]
while p != S:
    rows[p[0]][p[1]] = "*"
    p, length = parent[p], length + 1
print("path length =", length, "expanded =", expanded)
print("\n".join("".join(r) for r in rows))
