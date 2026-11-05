def poly(s, base, mod):
    h = 0
    for ch in s:
        h = (h * base + ord(ch)) % mod
    return h


def hashes(s, k, m):
    h1, h2 = poly(s, 31, 1000000007), poly(s, 37, 998244353) | 1
    return [(h1 + i * h2) % m for i in range(k)]


class CountingBloom:
    """每格是 4 位元計數器（上限 15）：飽和後不再增減，避免溢位造成漏判"""
    MAX = 15

    def __init__(self, m=16, k=3):
        self.m, self.k, self.c = m, k, [0] * m

    def add(self, s):
        for p in hashes(s, self.k, self.m):
            if self.c[p] < self.MAX:
                self.c[p] += 1

    def query(self, s):
        return all(self.c[p] > 0 for p in hashes(s, self.k, self.m))

    def remove(self, s):
        if not self.query(s):
            return False  # 確定不存在：拒絕刪除
        for p in hashes(s, self.k, self.m):
            if self.c[p] < self.MAX:
                self.c[p] -= 1
        return True


cb = CountingBloom()
for w in ["apple", "banana", "cherry"]:
    cb.add(w)
print("counters:", *cb.c)
print("remove banana:", cb.remove("banana"))
print("counters:", *cb.c)
for w in ["apple", "banana", "cherry", "kiwi"]:
    print(f"{w}: {'maybe' if cb.query(w) else 'no'}")
print("remove kiwi:", cb.remove("kiwi"))
for _ in range(20):
    cb.add("apple")
print("after 20 more apple:", *cb.c)
