import math

N = 16


def shapes():
    a = [[30] * N for _ in range(N)]
    for r in range(N):
        for c in range(N):
            if 2 <= r <= 6 and 2 <= c <= 7:
                a[r][c] = 200
            if (r - 10.5) ** 2 + (c - 10.5) ** 2 <= 12.96:
                a[r][c] = 140
            if 9 <= r <= 14 and 1 <= c <= r - 8:
                a[r][c] = 90
    return a


def noisy():
    a, s = shapes(), 7
    for r in range(N):
        for c in range(N):
            s = s * 48271 % 2147483647
            t = s % 100
            a[r][c] = 0 if t < 5 else 255 if t < 10 else a[r][c]
    return a


def kernel(sigma):
    """一維高斯：半徑 ⌈3σ⌉（最多 3），正規化成總和 1"""
    rad = min(3, math.ceil(3 * sigma))
    k = [math.exp(-((i - rad) ** 2) / (2 * sigma * sigma)) for i in range(2 * rad + 1)]
    s = sum(k)
    return [v / s for v in k]


def at(a, r, c, mode):
    if 0 <= r < N and 0 <= c < N:
        return a[r][c]
    if mode == "zero":
        return 0
    return a[min(N - 1, max(0, r))][min(N - 1, max(0, c))]


def blur(a, sigma, mode):
    """可分離：先水平再垂直"""
    k = kernel(sigma)
    rad = len(k) // 2
    h = [[sum(k[j + rad] * at(a, r, c + j, mode) for j in range(-rad, rad + 1)) for c in range(N)] for r in range(N)]
    return [[sum(k[i + rad] * at(h, r + i, c, mode) for i in range(-rad, rad + 1)) for c in range(N)] for r in range(N)]


A = noisy()
for sigma in [0.6, 1.0, 2.0]:
    out = blur(A, sigma, "replicate")
    print(f"sigma {sigma}: kernel {' '.join(f'{v:.6f}' for v in kernel(sigma))}")
    print(f"  out(5,4) = {out[5][4]:.3f}, out(8,8) = {out[8][8]:.3f}, out(0,0) = {out[0][0]:.3f}, sum = {sum(map(sum, out)):.3f}")
const = [[120] * N for _ in range(N)]
for mode in ["replicate", "zero"]:
    out = blur(const, 1.0, mode)
    print(f"constant image, border {mode}: max deviation {max(abs(v - 120) for row in out for v in row):.3f}")
