def linear_sieve(n):
    """線性篩：每個合數只被它的「最小質因數」劃掉一次，因此總共 O(n)"""
    spf = [0] * (n + 1)  # spf[i] = i 的最小質因數
    primes = []
    for i in range(2, n + 1):
        if spf[i] == 0:
            spf[i] = i
            primes.append(i)
        for p in primes:
            if p > spf[i] or i * p > n:
                break
            spf[i * p] = p
    return primes, spf


primes, spf = linear_sieve(60)
print("primes:", *primes)
print("smallest prime factor of 2..20:", *spf[2:21])
