MAZE = ["S.#.......#.....",
        ".##.#####.#.###.",
        "....#...#...#...",
        ".####.#.#####.#.",
        "......#.......#.",
        "#######.#####.#.",
        "......#.#.....#.",
        ".####.#.#.#####.",
        ".#....#...#....E"]
R, C = len(MAZE), len(MAZE[0])
DIRS = [(0, 1), (1, 0), (0, -1), (-1, 0)]  # 右、下、左、上
grid = [list(row) for row in MAZE]
seen = set()


def dfs(r, c):
    """往四個方向深入；走到死路就退回上一格換方向（回溯），到達 E 時整條路徑都還在遞迴堆疊上"""
    if grid[r][c] == "E":
        return True
    seen.add((r, c))
    for dr, dc in DIRS:
        nr, nc = r + dr, c + dc
        if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] != "#" and (nr, nc) not in seen:
            if grid[nr][nc] == ".":
                grid[nr][nc] = "*"
            if dfs(nr, nc):
                return True
            if grid[nr][nc] == "*":
                grid[nr][nc] = "."
    return False


found = dfs(0, 0)
print("found:", found, "path length =", sum(row.count("*") for row in grid) + 1)
print("\n".join("".join(row) for row in grid))
