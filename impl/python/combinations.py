def combinations(n, k):
    """從 start 開始挑下一個數，保證組合內遞增、不會重複；剩下的數不夠湊滿 k 個就剪枝"""
    out, cur = [], []

    def bt(start):
        if len(cur) == k:
            out.append(cur[:])
            return
        for x in range(start, n - (k - len(cur)) + 2):
            cur.append(x)
            bt(x + 1)
            cur.pop()

    bt(1)
    return out


res = combinations(5, 3)
for c in res:
    print(*c)
print("count =", len(res))
