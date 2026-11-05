def tilings(R, C):
    """逐欄處理；遮罩記錄目前這一欄已被前一欄橫放骨牌佔走的列"""
    dp = {0: 1}
    for _ in range(C):
        nd = {}

        def fill(row, cur, nxt, ways):
            if row == R:
                nd[nxt] = nd.get(nxt, 0) + ways
                return
            if cur >> row & 1:
                fill(row + 1, cur, nxt, ways)
                return
            fill(row + 1, cur, nxt | (1 << row), ways)          # 橫放
            if row + 1 < R and not cur >> (row + 1) & 1:
                fill(row + 2, cur, nxt, ways)                   # 直放

        for m, w in dp.items():
            fill(0, m, 0, w)
        dp = nd
    return dp.get(0, 0)


def brute(R, C):
    g = [[False] * C for _ in range(R)]

    def go(pos):
        if pos == R * C:
            return 1
        i, j = divmod(pos, C)
        if g[i][j]:
            return go(pos + 1)
        total = 0
        if j + 1 < C and not g[i][j + 1]:
            g[i][j] = g[i][j + 1] = True
            total += go(pos + 1)
            g[i][j] = g[i][j + 1] = False
        if i + 1 < R:
            g[i][j] = g[i + 1][j] = True
            total += go(pos + 1)
            g[i][j] = g[i + 1][j] = False
        return total

    return go(0)


for R, C in [(3, 4), (2, 8), (4, 4), (3, 3), (4, 6), (6, 6)]:
    print(f"{R}x{C}: {tilings(R, C)} tilings" + (f" (brute {brute(R, C)})" if R * C <= 24 else ""))
