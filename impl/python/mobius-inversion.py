def mobius(N):
    mu = [1] * (N + 1)
    for x in range(2, N + 1):
        m, k, d, sq = x, 0, 2, False
        while d * d <= m:
            if m % d == 0:
                m //= d
                k += 1
                if m % d == 0:
                    sq = True
                while m % d == 0:
                    m //= d
            d += 1
        if m > 1:
            k += 1
        mu[x] = 0 if sq else (-1 if k % 2 else 1)
    return mu


def invert(f):
    """g(n) = Σ_{d|n} f(d)；再以 f(n) = Σ_{d|n} μ(n/d)·g(d) 還原"""
    N = len(f)
    mu = mobius(N)
    g = [sum(f[d - 1] for d in range(1, n + 1) if n % d == 0) for n in range(1, N + 1)]
    back = [sum(mu[n // d] * g[d - 1] for d in range(1, n + 1) if n % d == 0) for n in range(1, N + 1)]
    return g, back


for f in [[1, 1, 2, 2, 4, 2, 6, 4, 6, 4, 10, 4], [3, -1, 4, 1, -5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3], [1] * 12]:
    g, back = invert(f)
    print(f"g: {' '.join(map(str, g))}")
    print(f"f recovered: {' '.join(map(str, back))} (match {back == f})")
