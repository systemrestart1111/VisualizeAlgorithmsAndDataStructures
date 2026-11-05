class SqrtDecomposition:
    """每 B 個一塊並預存塊總和；查詢時完整的塊直接用總和，兩端零散元素逐一相加"""

    def __init__(self, a, B=4):
        self.a, self.B = a[:], B
        self.sums = [sum(a[i:i + B]) for i in range(0, len(a), B)]

    def set(self, i, v):
        self.sums[i // self.B] += v - self.a[i]
        self.a[i] = v

    def query(self, l, r):
        s, i = 0, l
        while i <= r:
            if i % self.B == 0 and i + self.B - 1 <= r:
                s += self.sums[i // self.B]
                i += self.B
            else:
                s += self.a[i]
                i += 1
        return s


d = SqrtDecomposition([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3])
print("blocks:", *d.sums)
print("sum[2, 13] =", d.query(2, 13))
d.set(5, 0)
print("after a[5] = 0, blocks:", *d.sums)
print("sum[4, 7] =", d.query(4, 7), "| sum[0, 15] =", d.query(0, 15), "| sum[9, 9] =", d.query(9, 9))
