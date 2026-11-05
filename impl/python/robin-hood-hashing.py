class RobinHood:
    """線性探測 + 劫富濟貧：遇到探測距離比自己小的元素就交換；刪除用後移"""

    def __init__(self, m=11):
        self.m = m
        self.t = [None] * m  # (key, dist)

    def insert(self, x):
        if self.find(x) >= 0:
            return
        cur, i = (x, 0), x % self.m
        while True:
            s = self.t[i]
            if s is None:
                self.t[i] = cur
                return
            if s[1] < cur[1]:
                self.t[i], cur = cur, s
            i = (i + 1) % self.m
            cur = (cur[0], cur[1] + 1)

    def find(self, x):
        i, d = x % self.m, 0
        while d < self.m:
            s = self.t[i]
            if s is None or s[1] < d:
                return -1
            if s[0] == x:
                return i
            i, d = (i + 1) % self.m, d + 1
        return -1

    def delete(self, x):
        i = self.find(x)
        if i < 0:
            return
        self.t[i] = None
        j = (i + 1) % self.m
        while self.t[j] is not None and self.t[j][1] > 0:
            self.t[i] = (self.t[j][0], self.t[j][1] - 1)
            self.t[j] = None
            i, j = j, (j + 1) % self.m

    def show(self):
        return " ".join("." if s is None else f"{s[0]}/{s[1]}" for s in self.t)


r = RobinHood()
for x in [22, 33, 1, 12, 44, 5, 16, 27]:
    r.insert(x)
print("table:", r.show())
print("find 27:", r.find(27), "| find 9:", r.find(9))
r.delete(33)
print("after delete 33:", r.show())
print("find 44:", r.find(44), "| find 27:", r.find(27))
