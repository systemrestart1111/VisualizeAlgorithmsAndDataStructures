X = 15


class LiChao:
    """每個節點保存在中點較小的直線；另一條只可能在某一半較小，遞迴進入那一半"""

    def __init__(self):
        self.tree = {}

    def insert(self, line, o=1, l=0, r=X):
        f = lambda ln, x: ln[0] * x + ln[1]
        if o not in self.tree:
            self.tree[o] = line
            return
        m = (l + r) // 2
        cur = self.tree[o]
        if f(line, m) < f(cur, m):
            self.tree[o], line = line, cur
        if l == r:
            return
        if f(line, l) < f(self.tree[o], l):
            self.insert(line, 2 * o, l, m)
        elif f(line, r) < f(self.tree[o], r):
            self.insert(line, 2 * o + 1, m + 1, r)

    def query(self, x):
        o, l, r, best = 1, 0, X, float("inf")
        while o in self.tree:
            ln = self.tree[o]
            best = min(best, ln[0] * x + ln[1])
            if l == r:
                break
            m = (l + r) // 2
            o, l, r = (2 * o, l, m) if x <= m else (2 * o + 1, m + 1, r)
        return best


lines = [(1, 2), (-1, 10), (0, 6), (2, -6), (-2, 20), (1, 3)]
t = LiChao()
for ln in lines:
    t.insert(ln)
for x in range(0, X + 1, 3):
    print(f"x = {x:2d}: li chao {t.query(x)}, brute {min(a * x + b for a, b in lines)}")
