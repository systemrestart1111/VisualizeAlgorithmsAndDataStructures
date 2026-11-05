PUZZLE = ["530070000", "600195000", "098000060", "800060003", "400803001",
          "700020006", "060000280", "000419005", "000080079"]
board = [[int(ch) for ch in row] for row in PUZZLE]


def ok(r, c, d):
    """同列、同欄、同 3x3 宮內都不能出現 d"""
    if any(board[r][j] == d for j in range(9)) or any(board[i][c] == d for i in range(9)):
        return False
    br, bc = r // 3 * 3, c // 3 * 3
    return all(board[br + i][bc + j] != d for i in range(3) for j in range(3))


def solve():
    """找下一個空格依序試 1..9，填不下去就回溯"""
    for r in range(9):
        for c in range(9):
            if board[r][c] == 0:
                for d in range(1, 10):
                    if ok(r, c, d):
                        board[r][c] = d
                        if solve():
                            return True
                        board[r][c] = 0
                return False
    return True


print("solved:", solve())
for row in board:
    print(" ".join(map(str, row)))
