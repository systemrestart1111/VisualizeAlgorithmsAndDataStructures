class WeightedDSU:
    """d[x] = val[x] − val[parent[x]]；路徑壓縮時把差值累加起來"""

    def __init__(self, n):
        self.p, self.d = list(range(n)), [0] * n

    def find(self, x):
        if self.p[x] == x:
            return x, 0
        r, w = self.find(self.p[x])
        self.d[x] += w
        self.p[x] = r
        return r, self.d[x]

    def relate(self, x, y, w):
        """加入條件 val[x] − val[y] = w；與既有關係矛盾時回傳 False"""
        (rx, dx), (ry, dy) = self.find(x), self.find(y)
        if rx == ry:
            return dx - dy == w
        self.p[rx] = ry
        self.d[rx] = w - dx + dy
        return True

    def diff(self, x, y):
        (rx, dx), (ry, dy) = self.find(x), self.find(y)
        return dx - dy if rx == ry else None


u = WeightedDSU(8)
for x, y, w in [(1, 0, 3), (2, 1, 2), (4, 3, -1), (5, 4, 4)]:
    u.relate(x, y, w)
for x, y in [(2, 0), (5, 3), (0, 2), (2, 5)]:
    r = u.diff(x, y)
    print(f"val[{x}] - val[{y}] =", "unknown" if r is None else r)
print("relate(5, 2, 1):", u.relate(5, 2, 1))
print("val[3] - val[0] =", u.diff(3, 0))
print("relate(3, 0, 0) consistent:", u.relate(3, 0, 0), "| relate(3, 0, -4) consistent:", u.relate(3, 0, -4))
