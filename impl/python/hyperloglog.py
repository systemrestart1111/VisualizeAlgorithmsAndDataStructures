import math

M32 = 0xFFFFFFFF


def poly(s, base, mod):
    h = 0
    for ch in s:
        h = (h * base + ord(ch)) % mod
    return h


def fmix32(h):
    h ^= h >> 16
    h = (h * 0x85EBCA6B) & M32
    h ^= h >> 13
    h = (h * 0xC2B2AE35) & M32
    h ^= h >> 16
    return h


class HyperLogLog:
    def __init__(self, p=4):
        self.p, self.m = p, 1 << p
        self.M = [0] * self.m

    def add(self, s):
        x = fmix32(poly(s, 31, 4294967291))
        j = x >> (32 - self.p)                      # 前 p 位選暫存器
        w = (x << self.p) & M32                     # 其餘位元
        rho = min(32 - self.p + 1, 32 - w.bit_length() + 1)
        self.M[j] = max(self.M[j], rho)

    def estimate(self):
        z = sum(2.0 ** -r for r in self.M)
        e = 0.673 * self.m * self.m / z
        v = self.M.count(0)
        if e <= 2.5 * self.m and v > 0:             # 小基數：線性計數校正
            e = self.m * math.log(self.m / v)
        return e


for n in (5, 50, 1000, 20000):
    h = HyperLogLog()
    for i in range(1, n + 1):
        h.add(f"item{i}")
    for i in range(1, n + 1, 2):                    # 重複加入不影響
        h.add(f"item{i}")
    print(f"n = {n}: estimate {h.estimate():.2f}, registers {' '.join(map(str, h.M))}")
