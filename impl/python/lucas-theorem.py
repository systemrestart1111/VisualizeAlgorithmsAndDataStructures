def is_prime(n):
    return n >= 2 and all(n % d for d in range(2, int(n ** 0.5) + 1))


def lucas(n, k, p):
    """C(n, k) ≡ ∏ C(nᵢ, kᵢ) (mod p)，nᵢ、kᵢ 是 p 進位的各位數"""
    fact = [1] * p
    for i in range(1, p):
        fact[i] = fact[i - 1] * i % p

    def small(a, b):
        if b > a:
            return 0
        return fact[a] * pow(fact[b], p - 2, p) * pow(fact[a - b], p - 2, p) % p

    res = 1
    while n or k:
        ni, ki = n % p, k % p
        if ki > ni:
            return 0
        res = res * small(ni, ki) % p
        n //= p
        k //= p
    return res


def pascal(n, k, p):
    row = [1] + [0] * k
    for i in range(1, n + 1):
        for j in range(min(i, k), 0, -1):
            row[j] = (row[j] + row[j - 1]) % p
    return row[k]


for n, k, p in [(1000, 300, 13), (5, 2, 3), (100, 50, 7), (10, 3, 2), (7, 9, 5), (999, 0, 11),
                (10 ** 12, 123456789, 99991), (10 ** 15, 10 ** 14, 7), (6, 2, 4)]:
    if not is_prime(p):
        print(f"C({n},{k}) mod {p}: {p} is not prime")
    elif n <= 1000:
        print(f"C({n},{k}) mod {p} = {lucas(n, k, p)} (pascal {pascal(n, k, p) if k <= n else 0})")
    else:
        print(f"C({n},{k}) mod {p} = {lucas(n, k, p)}")
