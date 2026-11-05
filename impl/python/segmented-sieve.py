import math


def segmented_sieve(lo, hi):
    """先用普通篩法求出 √hi 以內的質數，再只在 [lo, hi] 這一段裡劃掉它們的倍數（記憶體只需區間長度）"""
    lim = math.isqrt(hi)
    small = [p for p in range(2, lim + 1) if all(p % q for q in range(2, math.isqrt(p) + 1))]
    mark = [True] * (hi - lo + 1)
    for p in small:
        start = max(p * p, (lo + p - 1) // p * p)  # 區間內第一個 p 的倍數
        for m in range(start, hi + 1, p):
            mark[m - lo] = False
    return small, [lo + i for i, ok in enumerate(mark) if ok and lo + i >= 2]


small, primes = segmented_sieve(1000, 1060)
print("base primes <= sqrt(1060):", *small)
print("primes in [1000, 1060]:", *primes)
