from math import gcd


def phi(n):
    """φ(n) = n·∏(1 − 1/p)，以 result −= result / p 實作"""
    result, p = n, 2
    while p * p <= n:
        if n % p == 0:
            while n % p == 0:
                n //= p
            result -= result // p
        p += 1
    if n > 1:
        result -= result // n
    return result


for n in [1, 2, 36, 97, 100, 360, 1000000, 999999937, 600851475143]:
    if n <= 1000:
        brute = sum(1 for x in range(1, n + 1) if gcd(x, n) == 1)
        print(f"phi({n}) = {phi(n)} (gcd count {brute})")
    else:
        print(f"phi({n}) = {phi(n)}")
