ROWS, COLS, SEED = 8, 12, 42
state = SEED


def rand(k):
    """Park–Miller 亂數產生器：五種語言用同一個公式，因此會產生同一個迷宮"""
    global state
    state = state * 48271 % 2147483647
    return state % k


# 迷宮格子 (r, c) 位於字元圖的 (2r+1, 2c+1)；一開始全是牆
grid = [["#"] * (2 * COLS + 1) for _ in range(2 * ROWS + 1)]
visited = [[False] * COLS for _ in range(ROWS)]
DIRS = [(-1, 0), (0, 1), (1, 0), (0, -1)]  # 上、右、下、左

# 遞迴回溯法（用堆疊實作）：從目前格子隨機走向一個沒去過的鄰格並打通中間的牆；四周都去過就退回上一格
stack = [(0, 0)]
visited[0][0] = True
grid[1][1] = " "
while stack:
    r, c = stack[-1]
    nbrs = [(r + dr, c + dc) for dr, dc in DIRS
            if 0 <= r + dr < ROWS and 0 <= c + dc < COLS and not visited[r + dr][c + dc]]
    if not nbrs:
        stack.pop()
        continue
    nr, nc = nbrs[rand(len(nbrs))]
    grid[r + nr + 1][c + nc + 1] = " "  # 兩格中間的牆
    grid[2 * nr + 1][2 * nc + 1] = " "
    visited[nr][nc] = True
    stack.append((nr, nc))
print("\n".join("".join(row) for row in grid))
