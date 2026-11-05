N = 6
MOVES = [(2, 1), (1, 2), (-1, 2), (-2, 1), (-2, -1), (-1, -2), (1, -2), (2, -1)]
board = [[0] * N for _ in range(N)]
backtracks = 0


def onward(r, c):
    """從 (r, c) 還能跳到幾個沒走過的格子"""
    return sum(0 <= r + dr < N and 0 <= c + dc < N and board[r + dr][c + dc] == 0 for dr, dc in MOVES)


def tour(r, c, step):
    """Warnsdorff 規則：優先跳到「之後出路最少」的格子；仍走不通時回溯"""
    global backtracks
    board[r][c] = step
    if step == N * N:
        return True
    cand = [(r + dr, c + dc) for dr, dc in MOVES if 0 <= r + dr < N and 0 <= c + dc < N and board[r + dr][c + dc] == 0]
    cand.sort(key=lambda p: onward(*p))  # 穩定排序，同分保持 MOVES 的順序
    for nr, nc in cand:
        if tour(nr, nc, step + 1):
            return True
    board[r][c] = 0
    backtracks += 1
    return False


print("found:", tour(0, 0, 1), "backtracks =", backtracks)
for row in board:
    print("".join(f"{x:3d}" for x in row))
