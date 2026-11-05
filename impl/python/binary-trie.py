W = 5


class BinaryTrie:
    """固定 W 位元，由高位到低位；每個節點記錄經過的數字個數，支援重複與刪除"""

    def __init__(self):
        self.ch, self.cnt = [[-1, -1]], [0]

    def add(self, x, d):
        u = 0
        self.cnt[0] += d
        for i in range(W - 1, -1, -1):
            b = (x >> i) & 1
            if self.ch[u][b] < 0:
                self.ch[u][b] = len(self.cnt)
                self.ch.append([-1, -1])
                self.cnt.append(0)
            u = self.ch[u][b]
            self.cnt[u] += d

    def max_xor(self, x):
        """每一位盡量走與 x 相反的分支"""
        u, y = 0, 0
        for i in range(W - 1, -1, -1):
            b = (x >> i) & 1
            v = self.ch[u][1 - b]
            if v >= 0 and self.cnt[v] > 0:
                u, y = v, y | ((1 - b) << i)
            else:
                u, y = self.ch[u][b], y | (b << i)
        return y


t = BinaryTrie()
for x in [3, 10, 5, 25, 2, 8]:
    t.add(x, 1)
for x in [5, 25, 7, 31, 0]:
    y = t.max_xor(x)
    print(f"max xor with {x:2d}: {y:2d} -> {x ^ y}")
t.add(25, -1)
y = t.max_xor(5)
print(f"after delete 25, max xor with 5: {y} -> {5 ^ y}")
