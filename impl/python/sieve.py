def sieve(n):
    """埃拉托斯特尼篩法：從每個質數 p 的 p² 開始，把它的倍數全部劃掉"""
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    p = 2
    while p * p <= n:
        if is_prime[p]:
            for m in range(p * p, n + 1, p):
                is_prime[m] = False
        p += 1
    return [i for i in range(n + 1) if is_prime[i]]


primes = sieve(100)
print("primes <= 100:", *primes)
print("count =", len(primes))
