BASES = [2, 3, 5, 7, 11, 13, 17]


def is_probable_prime(n):
    """寫成 n-1 = d·2^s；對每個底數 a，若 a^d ≢ 1 且平方 s 次都沒出現 -1，a 就是「合數的證人」"""
    if n < 2:
        return False, None
    if n % 2 == 0:
        return n == 2, 2
    d, s = n - 1, 0
    while d % 2 == 0:
        d //= 2
        s += 1
    for a in BASES:
        if a % n == 0:
            continue
        x = pow(a, d, n)
        if x in (1, n - 1):
            continue
        for _ in range(s - 1):
            x = x * x % n
            if x == n - 1:
                break
        else:
            return False, a
    return True, None


for n in [561, 7919, 1000003, 25326001, 2147483647]:
    prime, witness = is_probable_prime(n)
    print(f"{n}: prime" if prime else f"{n}: composite (witness {witness})")
