class Fenwick:
    """t[i] 負責區間 (i - lowbit(i), i]；更新與前綴和都只走 O(log n) 個位置（索引從 1 開始）"""

    def __init__(self, a):
        self.n = len(a)
        self.t = [0] * (self.n + 1)
        for i, v in enumerate(a, 1):
            self.add(i, v)

    def add(self, i, v):
        while i <= self.n:
            self.t[i] += v
            i += i & -i  # 往上走到下一個也涵蓋 i 的位置

    def prefix(self, i):
        s = 0
        while i > 0:
            s += self.t[i]
            i -= i & -i  # 去掉最低位的 1
        return s

    def range_sum(self, l, r):
        return self.prefix(r) - self.prefix(l - 1)


f = Fenwick([3, 2, -1, 6, 5, 4, -3, 3, 7, 2, 3, 1])
print("t[1..12] =", " ".join(map(str, f.t[1:])))
print("prefix(7) =", f.prefix(7))
print("sum[3, 9] =", f.range_sum(3, 9))
f.add(5, 4); print("add +4 at 5")
print("prefix(7) =", f.prefix(7))
print("sum[3, 9] =", f.range_sum(3, 9))
print("t[1..12] =", " ".join(map(str, f.t[1:])))
