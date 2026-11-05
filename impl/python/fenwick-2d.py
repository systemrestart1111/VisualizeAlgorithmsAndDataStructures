class Fenwick2D:
    """兩個維度各自沿 lowbit 跳：更新往上、查詢往下（1 起算）"""

    def __init__(self, n, m):
        self.n, self.m = n, m
        self.t = [[0] * (m + 1) for _ in range(n + 1)]

    def add(self, r, c, v):
        i = r
        while i <= self.n:
            j = c
            while j <= self.m:
                self.t[i][j] += v
                j += j & -j
            i += i & -i

    def prefix(self, r, c):
        s, i = 0, r
        while i > 0:
            j = c
            while j > 0:
                s += self.t[i][j]
                j -= j & -j
            i -= i & -i
        return s

    def rect(self, r1, c1, r2, c2):
        return self.prefix(r2, c2) - self.prefix(r1 - 1, c2) - self.prefix(r2, c1 - 1) + self.prefix(r1 - 1, c1 - 1)


f = Fenwick2D(6, 6)
a = [[0] * 7 for _ in range(7)]
for r, c, v in [(1, 1, 3), (2, 3, 5), (4, 2, 2), (3, 5, 4), (6, 6, 1), (5, 4, 6)]:
    f.add(r, c, v)
    a[r][c] += v
queries = [(1, 1, 6, 6), (2, 2, 4, 5), (3, 3, 3, 3), (4, 1, 6, 4)]
for q in queries:
    brute = sum(a[i][j] for i in range(q[0], q[2] + 1) for j in range(q[1], q[3] + 1))
    print(f"sum{q} = {f.rect(*q)} (brute {brute})")
f.add(4, 4, 10)
print("after add(4, 4, 10): sum(2, 2, 4, 5) =", f.rect(2, 2, 4, 5))
