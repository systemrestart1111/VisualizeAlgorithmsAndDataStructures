def solve_n_queens(n):
    """逐列放皇后；用三個集合記錄被佔用的欄與兩條對角線，衝突就換下一欄（回溯）"""
    cols, d1, d2 = set(), set(), set()
    pos, sols = [], []

    def bt(r):
        if r == n:
            sols.append(pos[:])
            return
        for c in range(n):
            if c in cols or r - c in d1 or r + c in d2:
                continue
            cols.add(c); d1.add(r - c); d2.add(r + c); pos.append(c)
            bt(r + 1)
            cols.remove(c); d1.remove(r - c); d2.remove(r + c); pos.pop()

    bt(0)
    return sols


sols = solve_n_queens(6)
print("solutions =", len(sols))
for c in sols[0]:
    print(" ".join("Q" if i == c else "." for i in range(6)))
