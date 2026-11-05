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


def harris(A, k):
    """結構張量 M（高斯加權），R = det(M) − k·trace(M)²；R 四捨五入成整數後做 3×3 非極大值抑制"""
    gx = conv(A, [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])
    gy = conv(A, [[-1, -2, -1], [0, 0, 0], [1, 2, 1]])
    Ix = [[v / 8 for v in row] for row in gx]
    Iy = [[v / 8 for v in row] for row in gy]
    Sxx = blur1([[Ix[r][c] ** 2 for c in range(N)] for r in range(N)])
    Syy = blur1([[Iy[r][c] ** 2 for c in range(N)] for r in range(N)])
    Sxy = blur1([[Ix[r][c] * Iy[r][c] for c in range(N)] for r in range(N)])
    R = [[math.floor(Sxx[r][c] * Syy[r][c] - Sxy[r][c] ** 2 - k * (Sxx[r][c] + Syy[r][c]) ** 2 + 0.5) for c in range(N)] for r in range(N)]
    mx, mn = max(map(max, R)), min(map(min, R))
    corners = []
    for i in range(N):
        for j in range(N):
            if R[i][j] <= 0.1 * mx:
                continue
            ok = all(not (0 <= i + a < N and 0 <= j + b < N) or (a == 0 and b == 0) or not (R[i + a][j + b] > R[i][j] or (R[i + a][j + b] == R[i][j] and (a < 0 or (a == 0 and b < 0)))) for a in (-1, 0, 1) for b in (-1, 0, 1))
            if ok:
                corners.append((i, j))
    edges = sum(1 for row in R for v in row if v < 0.1 * mn)
    return corners, mx, edges


for name in ["checker", "shapes"]:
    for k in [0.04, 0.06]:
        corners, mx, edges = harris(preset(name), k)
        print(f"{name}, k = {k}: max R = {mx}, edge pixels {edges}, {len(corners)} corners: " + " ".join(f"({i},{j})" for i, j in corners))
