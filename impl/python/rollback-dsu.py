class RollbackDSU:
    """依大小合併、不做路徑壓縮；每次合併推入紀錄，可撤回到快照"""

    def __init__(self, n):
        self.p, self.sz, self.hist = list(range(n)), [1] * n, []

    def find(self, x):
        while self.p[x] != x:
            x = self.p[x]
        return x

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return False
        if self.sz[rx] > self.sz[ry]:
            rx, ry = ry, rx
        self.p[rx] = ry
        self.sz[ry] += self.sz[rx]
        self.hist.append((rx, ry))
        return True

    def snapshot(self):
        return len(self.hist)

    def rollback(self, snap):
        while len(self.hist) > snap:
            rx, ry = self.hist.pop()
            self.p[rx] = rx
            self.sz[ry] -= self.sz[rx]


d = RollbackDSU(8)
d.union(0, 1)
d.union(2, 3)
s = d.snapshot()
d.union(1, 3)
d.union(4, 5)
d.union(5, 0)
print("parents:", *d.p, "| sizes:", *d.sz)
print("same(4, 2):", d.find(4) == d.find(2))
d.rollback(s)
print("after rollback:", *d.p, "| sizes:", *d.sz)
print("same(4, 2):", d.find(4) == d.find(2), "| same(0, 1):", d.find(0) == d.find(1))
