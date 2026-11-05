def mobius_sieve(N):
    """線性篩：質數 μ = −1；i % p == 0 時 i·p 含 p²，μ = 0；否則 μ(i·p) = −μ(i)"""
    mu = [0] * (N + 1)
    mu[1] = 1
    comp = [False] * (N + 1)
    primes = []
    for i in range(2, N + 1):
        if not comp[i]:
            primes.append(i)
            mu[i] = -1
        for p in primes:
            if i * p > N:
                break
            comp[i * p] = True
            if i % p == 0:
                mu[i * p] = 0
                break
            mu[i * p] = -mu[i]
    return mu


def by_factoring(x):
    k, d = 0, 2
    while d * d <= x:
        if x % d == 0:
            x //= d
            if x % d == 0:
                return 0
            k += 1
        d += 1
    if x > 1:
        k += 1
    return -1 if k % 2 else 1


mu = mobius_sieve(30)
print("mu(1..30): " + " ".join(map(str, mu[1:])))
N = 1000
mu = mobius_sieve(N)
print(f"N={N}: +1 {mu.count(1)}, -1 {mu.count(-1)}, 0 {mu.count(0) - 1}, Mertens {sum(mu)}")
print(f"check by factoring: {all(mu[x] == by_factoring(x) for x in range(1, N + 1))}")
