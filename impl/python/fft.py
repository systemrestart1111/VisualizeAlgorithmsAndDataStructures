import cmath


def fft(a, invert=False):
    """迭代版 Cooley–Tukey：先做位元反轉排列，再由長度 2、4、8… 逐層做蝴蝶運算，O(n log n)"""
    n = len(a)
    j = 0
    for i in range(1, n):  # 位元反轉
        bit = n >> 1
        while j & bit:
            j ^= bit
            bit >>= 1
        j |= bit
        if i < j:
            a[i], a[j] = a[j], a[i]
    length = 2
    while length <= n:
        w_len = cmath.exp((-2j if not invert else 2j) * cmath.pi / length)
        for i in range(0, n, length):
            w = 1
            for k in range(length // 2):
                u, v = a[i + k], a[i + k + length // 2] * w
                a[i + k], a[i + k + length // 2] = u + v, u - v
                w *= w_len
        length *= 2
    if invert:
        for i in range(n):
            a[i] /= n


def multiply(A, B):
    """在「點值表示」下多項式相乘只需逐點相乘：FFT → 相乘 → 逆 FFT"""
    n = 1
    while n < len(A) + len(B) - 1:
        n *= 2
    fa = [complex(x) for x in A] + [0j] * (n - len(A))
    fb = [complex(x) for x in B] + [0j] * (n - len(B))
    fft(fa)
    fft(fb)
    fc = [x * y for x, y in zip(fa, fb)]
    fft(fc, invert=True)
    return [round(c.real) for c in fc[:len(A) + len(B) - 1]]


A, B = [1, 2, 3], [4, 5, 6]  # 係數由低次到高次
print("A x B =", *multiply(A, B))
