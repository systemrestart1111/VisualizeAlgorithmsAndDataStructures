import math

N = 16


def preset(name):
    if name == "checker":
        return [[210 if ((r >> 2) + (c >> 2)) % 2 else 40 for c in range(N)] for r in range(N)]
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


def at(a, r, c):
    return a[min(N - 1, max(0, r))][min(N - 1, max(0, c))]


def conv(a, K):
    h, w = len(K) // 2, len(K[0]) // 2
    return [[sum(K[i + h][j + w] * at(a, r + i, c + j) for i in range(-h, h + 1) for j in range(-w, w + 1)) for c in range(N)] for r in range(N)]


def blur1(a):
    k = [math.exp(-(i * i) / 2) for i in range(-3, 4)]
    s = sum(k)
    k = [v / s for v in k]
    return conv(conv(a, [k]), [[v] for v in k])


def shi_tomasi(A, q, dist):
    """λmin = trace/2 − √((Sxx−Syy)²/4 + Sxy²)；依分數由大到小貪婪挑選，保持最小間距"""
    gx = conv(A, [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])
    gy = conv(A, [[-1, -2, -1], [0, 0, 0], [1, 2, 1]])
    Ix = [[v / 8 for v in row] for row in gx]
    Iy = [[v / 8 for v in row] for row in gy]
    Sxx = blur1([[Ix[r][c] ** 2 for c in range(N)] for r in range(N)])
    Syy = blur1([[Iy[r][c] ** 2 for c in range(N)] for r in range(N)])
    Sxy = blur1([[Ix[r][c] * Iy[r][c] for c in range(N)] for r in range(N)])
    lam = [[math.floor(((Sxx[r][c] + Syy[r][c]) / 2 - math.sqrt(((Sxx[r][c] - Syy[r][c]) / 2) ** 2 + Sxy[r][c] ** 2)) * 1000 + 0.5) / 1000 for c in range(N)] for r in range(N)]
    mx = max(map(max, lam))
    cand = sorted([(r, c) for r in range(N) for c in range(N) if mx > 0 and lam[r][c] >= q * mx], key=lambda p: (-lam[p[0]][p[1]], p[0], p[1]))
    chosen = []
    for r, c in cand:
        if all(math.hypot(r - y, c - x) >= dist for y, x in chosen):
            chosen.append((r, c))
    return len(cand), chosen


for name, q, dist in [("checker", 0.1, 3), ("checker", 0.1, 5), ("checker", 0.3, 3), ("shapes", 0.1, 3)]:
    nc, chosen = shi_tomasi(preset(name), q, dist)
    print(f"{name}, quality {q}, min distance {dist}: {nc} candidates, {len(chosen)} chosen: " + " ".join(f"({r},{c})" for r, c in chosen))
