def poly(s, base, mod):
    h = 0
    for ch in s:
        h = (h * base + ord(ch)) % mod
    return h


def hashes(s, k, m):
    """雙重雜湊：h_i = (h1 + i·h2) mod m"""
    h1, h2 = poly(s, 31, 1000000007), poly(s, 37, 998244353) | 1
    return [(h1 + i * h2) % m for i in range(k)]


class Bloom:
    def __init__(self, m=32, k=3):
        self.m, self.k, self.bits = m, k, [0] * m

    def add(self, s):
        for p in hashes(s, self.k, self.m):
            self.bits[p] = 1

    def might_contain(self, s):
        """有任一位元為 0 → 確定不存在；全為 1 → 可能存在"""
        return all(self.bits[p] for p in hashes(s, self.k, self.m))


bf = Bloom()
inserted = ["apple", "banana", "cherry", "grape"]
for w in inserted:
    bf.add(w)
print("bits:", "".join(map(str, bf.bits)))
for w in ["apple", "banana", "cherry", "grape", "kiwi", "lemon", "mango", "peach", "plum", "fig"]:
    res = "maybe" if bf.might_contain(w) else "no"
    note = " (false positive)" if res == "maybe" and w not in inserted else ""
    print(f"{w}: {res}{note}")
