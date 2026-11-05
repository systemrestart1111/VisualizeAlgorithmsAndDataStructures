import math

N = 16


def preset(name):
    a = [[0] * N for _ in range(N)]
    for r in range(N):
        for c in range(N):
            if name == "shapes":
                v = 30
                if 2 <= r <= 6 and 2 <= c <= 7:
                    v = 200
                if (r - 10.5) ** 2 + (c - 10.5) ** 2 <= 12.96:
                    v = 140
                if 9 <= r <= 14 and 1 <= c <= r - 8:
                    v = 90
            elif name == "step":
                v = (60 if c < 8 else 190) + (40 if r >= 11 else 0)
            else:
                v = 210 if ((r >> 2) + (c >> 2)) % 2 else 40
            a[r][c] = v
    return a


KX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]
KY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]]


def conv(a, K):
    g = lambda r, c: a[min(N - 1, max(0, r))][min(N - 1, max(0, c))]
    return [[sum(K[i + 1][j + 1] * g(r + i, c + j) for i in (-1, 0, 1) for j in (-1, 0, 1)) for c in range(N)] for r in range(N)]


for name in ["shapes", "step", "checker"]:
    A = preset(name)
    gx, gy = conv(A, KX), conv(A, KY)
    mag = [[math.hypot(gx[r][c], gy[r][c]) for c in range(N)] for r in range(N)]
    flat = [(r, c) for r in range(1, N - 1) for c in range(1, N - 1) if len({A[r + i][c + j] for i in (-1, 0, 1) for j in (-1, 0, 1)}) == 1]
    zero = all(gx[r][c] == 0 and gy[r][c] == 0 for r, c in flat)
    print(f"{name}: sum|Gx| = {sum(abs(v) for row in gx for v in row)}, sum|Gy| = {sum(abs(v) for row in gy for v in row)}, "
          f"Gx(5,7) = {gx[5][7]}, Gy(6,4) = {gy[6][4]}, max magnitude {max(map(max, mag)):.2f}, {len(flat)} flat pixels all zero {zero}")
