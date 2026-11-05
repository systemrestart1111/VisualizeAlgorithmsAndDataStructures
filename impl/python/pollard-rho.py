from math import gcd


def is_prime(n):
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True


def rho(n, log=None):
    """f(x) = x² + c；龜兔賽跑找 gcd(|x − y|, n) > 1；d == n 時換 c 重試"""
    c = 1
    while True:
        x = y = 2
        d, steps = 1, 0
        while d == 1:
            x = (x * x + c) % n
            y = (y * y + c) % n
            y = (y * y + c) % n
            d = gcd(abs(x - y), n)
            steps += 1
        if log is not None:
            log.append(f"c={c} steps={steps} d={d}" + (" (failed, retry)" if d == n else ""))
        if d != n:
            return d
        c += 1


def factor(n, out):
    if n == 1:
        return
    if is_prime(n):
        out.append(n)
    elif n % 2 == 0:
        out.append(2)
        factor(n // 2, out)
    else:
        d = rho(n)
        factor(d, out)
        factor(n // d, out)


for n in [8051, 25]:
    log = []
    rho(n, log)
    print(f"rho({n}): " + "; ".join(log))
for n in [1, 8051, 201275, 10403, 1022117, 1000003, 600851475143, 999985999949]:
    fs = []
    factor(n, fs)
    fs.sort()
    prod = 1
    for p in fs:
        prod *= p
    print(f"{n} = {' * '.join(map(str, fs)) or '1'} (product ok {prod == n})")
