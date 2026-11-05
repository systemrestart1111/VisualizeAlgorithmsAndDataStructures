from collections import deque

GRID = ["S....#....", ".##..#.##.", "....#....S", ".#.....#..", ".#.##.....", "...#...S.."]


def multi_bfs(grid):
    """所有起點同時入佇列、距離 0，第一次碰到某格時就是到最近起點的距離"""
    R, C = len(grid), len(grid[0])
    dist = [[-1] * C for _ in range(R)]
    q = deque()
    for i in range(R):
        for j in range(C):
            if grid[i][j] == "S":
                dist[i][j] = 0
                q.append((i, j))
    while q:
        i, j = q.popleft()
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            a, b = i + di, j + dj
            if 0 <= a < R and 0 <= b < C and grid[a][b] != "#" and dist[a][b] < 0:
                dist[a][b] = dist[i][j] + 1
                q.append((a, b))
    return dist


dist = multi_bfs(GRID)
for i, row in enumerate(dist):
    print(" ".join(" #" if GRID[i][j] == "#" else (" ." if d < 0 else f"{d:2d}") for j, d in enumerate(row)))
print("farthest cell distance:", max(max(r) for r in dist))
