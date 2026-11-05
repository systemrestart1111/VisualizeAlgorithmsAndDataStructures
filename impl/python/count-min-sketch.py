def poly(s, base, mod):
    h = 0
    for ch in s:
        h = (h * base + ord(ch)) % mod
    return h


def cols(s, d, w):
    h1, h2 = poly(s, 31, 1000000007), poly(s, 37, 998244353) | 1
    return [(h1 + i * h2) % w for i in range(d)]


class CountMin:
    """d 列 × w 欄計數器；查詢取 d 個計數的最小值（只會高估，不會低估）"""

    def __init__(self, d=3, w=8):
        self.d, self.w = d, w
        self.t = [[0] * w for _ in range(d)]

    def update(self, s, c=1):
        for i, j in enumerate(cols(s, self.d, self.w)):
            self.t[i][j] += c

    def query(self, s):
        return min(self.t[i][j] for i, j in enumerate(cols(s, self.d, self.w)))


cm = CountMin()
truth = {"apple": 5, "banana": 2, "cherry": 3, "grape": 1, "lemon": 4}
for k, v in truth.items():
    cm.update(k, v)
for row in cm.t:
    print(*row)
for k in ["apple", "banana", "cherry", "grape", "lemon", "kiwi"]:
    est = cm.query(k)
    print(f"{k}: estimate {est}, true {truth.get(k, 0)}, ok {est >= truth.get(k, 0)}")
