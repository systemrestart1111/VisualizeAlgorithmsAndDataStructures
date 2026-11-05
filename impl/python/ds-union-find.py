class DSU:
    """並查集：路徑壓縮 + 依秩合併，單次操作均攤接近 O(1)（反阿克曼函數）"""

    def __init__(self, n):
        self.p, self.rank = list(range(n)), [0] * n

    def find(self, x):
        root = x
        while self.p[root] != root:
            root = self.p[root]
        while self.p[x] != root:  # 路徑壓縮：沿路的節點都直接接到根
            self.p[x], x = root, self.p[x]
        return root

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra
        self.p[rb] = ra  # rank 較小的根接到較大的底下
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        return True

    def groups(self):
        g = {}
        for i in range(len(self.p)):
            g.setdefault(self.find(i), []).append(i)
        return [g[r] for r in sorted(g)]


def b(x):
    return "True" if x else "False"


d = DSU(10)
for a, c in [(1, 2), (3, 4), (2, 4), (5, 6), (7, 8), (8, 9)]:
    d.union(a, c)
    print(f"union({a}, {c}): parent =", " ".join(map(str, d.p)))
print("find(4) =", d.find(4), " parent =", " ".join(map(str, d.p)))
print("same(1, 3) ->", b(d.find(1) == d.find(3)), " same(1, 5) ->", b(d.find(1) == d.find(5)))
print("union(2, 3) ->", b(d.union(2, 3)), "(already together)")
print("sets:", " ".join("{" + ",".join(map(str, g)) + "}" for g in d.groups()))
