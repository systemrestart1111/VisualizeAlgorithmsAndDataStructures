def ntt(a, invert, p, g):
    """位元反轉 + 蝴蝶；單位根 w = g^((p−1)/len)，逆轉換用 w⁻¹ 並乘 n⁻¹"""
    n = len(a)
    j = 0
    for i in range(1, n):
        bit = n >> 1
        while j & bit:
            j ^= bit
            bit >>= 1
        j |= bit
        if i < j:
            a[i], a[j] = a[j], a[i]
    length = 2
    while length <= n:
        w = pow(g, (p - 1) // length, p)
        if invert:
            w = pow(w, p - 2, p)
        for i in range(0, n, length):
            wj = 1
            for k in range(length // 2):
                u, v = a[i + k], a[i + k + length // 2] * wj % p
                a[i + k], a[i + k + length // 2] = (u + v) % p, (u - v) % p
                wj = wj * w % p
        length <<= 1
    if invert:
        ninv = pow(n, p - 2, p)
        for i in range(n):
            a[i] = a[i] * ninv % p


def multiply(x, y, p, g):
    n = 1
    while n < len(x) + len(y) - 1:
        n <<= 1
    if (p - 1) % n:
        return None
    A = [v % p for v in x] + [0] * (n - len(x))
    B = [v % p for v in y] + [0] * (n - len(y))
    ntt(A, False, p, g)
    ntt(B, False, p, g)
    C = [A[i] * B[i] % p for i in range(n)]
    ntt(C, True, p, g)
    return C[:len(x) + len(y) - 1]


def naive(x, y, p):
    c = [0] * (len(x) + len(y) - 1)
    for i, u in enumerate(x):
        for j, v in enumerate(y):
            c[i + j] = (c[i + j] + u * v) % p
    return c


s = 2024
def rnd():
    global s
    s = s * 48271 % 2147483647
    return s


big1 = [rnd() % 998244353 for _ in range(10)]
big2 = [rnd() % 998244353 for _ in range(7)]
for x, y, p, g in [([1, 2, 3, 4], [5, 6, 7], 998244353, 3), ([1, 2, 3, 4], [5, 6, 7], 17, 3),
                   ([3, -1, 4], [1, 5, 9, 2, 6], 97, 5), (big1, big2, 998244353, 3), ([1] * 10, [1] * 10, 17, 3)]:
    r = multiply(x, y, p, g)
    if r is None:
        print(f"mod {p}: length {len(x) + len(y) - 1} padded size does not divide p-1, cannot transform")
    else:
        print(f"mod {p}: {' '.join(map(str, r))} (naive match {r == naive(x, y, p)})")
