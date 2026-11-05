def factorize(n):
    """試除法：從 2 開始除，能整除就一直除；試到 √n 為止，剩下的若大於 1 就是最後一個質因數"""
    factors = []
    d = 2
    while d * d <= n:
        e = 0
        while n % d == 0:
            n //= d
            e += 1
        if e:
            factors.append((d, e))
        d += 1
    if n > 1:
        factors.append((n, 1))
    return factors


f = factorize(360360)
print("360360 =", " x ".join(f"{p}^{e}" if e > 1 else str(p) for p, e in f))
