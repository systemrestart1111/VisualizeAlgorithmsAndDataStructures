def is_prime(n):
    return n > 1 and all(n % d for d in range(2, int(n ** 0.5) + 1))


class Cuckoo:
    """兩張表；鍵只能在 T1[x mod N] 或 T2[(x / N) mod N]。踢太多次視為循環，換更大的質數表重建"""

    def __init__(self, n=7):
        self.n = n
        self.t = [[None] * n, [None] * n]

    def h(self, i, x):
        return x % self.n if i == 0 else (x // self.n) % self.n

    def find(self, x):
        return self.t[0][self.h(0, x)] == x or self.t[1][self.h(1, x)] == x

    def items(self):
        return [v for row in self.t for v in row if v is not None]

    def place(self, x):
        cur = x
        for _ in range(2 * self.n):
            for i in (0, 1):
                p = self.h(i, cur)
                self.t[i][p], cur = cur, self.t[i][p]
                if cur is None:
                    return None
        return cur  # 循環：回傳手上剩下的鍵

    def insert(self, x):
        if self.find(x):
            return
        left = self.place(x)
        if left is not None:
            items = self.items() + [left]
            while True:
                n = self.n + 1
                while not is_prime(n):
                    n += 1
                self.n, self.t = n, [[None] * n, [None] * n]
                if all(self.place(v) is None for v in items):
                    break
            print(f"  rehash -> N = {self.n}")

    def delete(self, x):
        for i in (0, 1):
            if self.t[i][self.h(i, x)] == x:
                self.t[i][self.h(i, x)] = None


c = Cuckoo()
for x in [20, 50, 53, 75, 100, 67, 105, 3, 36, 39, 6]:
    print("insert", x)
    c.insert(x)
show = lambda row: " ".join("." if v is None else str(v) for v in row)
print("T1:", show(c.t[0]))
print("T2:", show(c.t[1]))
print("find 36:", c.find(36), "| find 37:", c.find(37))
c.delete(36)
print("after delete 36, find 36:", c.find(36))
