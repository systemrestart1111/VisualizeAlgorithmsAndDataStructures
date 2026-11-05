import math

N = 16


def preset(name):
    a = [[30] * N for _ in range(N)]
    for r in range(N):
        for c in range(N):
            if name == "step":
                a[r][c] = (60 if c < 8 else 190) + (40 if r >= 11 else 0)
                continue
            if 2 <= r <= 6 and 2 <= c <= 7:
                a[r][c] = 200
            if (r - 10.5) ** 2 + (c - 10.5) ** 2 <= 12.96:
                a[r][c] = 140
            if 9 <= r <= 14 and 1 <= c <= r - 8:
                a[r][c] = 90
    if name == "noisy":
        s = 7
        for r in range(N):
            for c in range(N):
                s = s * 48271 % 2147483647
                t = s % 100
                a[r][c] = 0 if t < 5 else 255 if t < 10 else a[r][c]
    return a


def at(a, r, c):
    return a[min(N - 1, max(0, r))][min(N - 1, max(0, c))]


def conv(a, K):
    h, w = len(K) // 2, len(K[0]) // 2
    return [[sum(K[i + h][j + w] * at(a, r + i, c + j) for i in range(-h, h + 1) for j in range(-w, w + 1)) for c in range(N)] for r in range(N)]


def canny(A, lo, hi):
    """高斯模糊 → Sobel → 沿梯度方向細化 → 雙門檻 → 從強邊 BFS 連結弱邊"""
    k = [math.exp(-(i * i) / 2) for i in range(-3, 4)]
    s = sum(k)
    k = [v / s for v in k]
    B = conv(conv(A, [k]), [[v] for v in k])
    gx = conv(B, [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])
    gy = conv(B, [[-1, -2, -1], [0, 0, 0], [1, 2, 1]])
    M = [[round(math.hypot(gx[r][c], gy[r][c]), 4) for c in range(N)] for r in range(N)]
    get = lambda r, c: M[r][c] if 0 <= r < N and 0 <= c < N else 0
    thin = [[0.0] * N for _ in range(N)]
    for r in range(N):
        for c in range(N):
            ang = math.degrees(math.atan2(gy[r][c], gx[r][c]))
            if ang < 0:
                ang += 180
            di, dj = (0, 1) if ang < 22.5 or ang >= 157.5 else (1, 1) if ang < 67.5 else (1, 0) if ang < 112.5 else (1, -1)
            if M[r][c] >= get(r + di, c + dj) and M[r][c] >= get(r - di, c - dj):
                thin[r][c] = M[r][c]
    mx = max(map(max, M)) or 1
    lab = [[2 if thin[r][c] >= hi * mx else 1 if thin[r][c] >= lo * mx else 0 for c in range(N)] for r in range(N)]
    strong = sum(row.count(2) for row in lab)
    weak = sum(row.count(1) for row in lab)
    queue = [(r, c) for r in range(N) for c in range(N) if lab[r][c] == 2]
    promoted = 0
    while queue:
        r, c = queue.pop(0)
        for a in (-1, 0, 1):
            for b in (-1, 0, 1):
                y, x = r + a, c + b
                if 0 <= y < N and 0 <= x < N and lab[y][x] == 1:
                    lab[y][x] = 2
                    promoted += 1
                    queue.append((y, x))
    return strong, weak, promoted, sum(row.count(2) for row in lab)


for name in ["shapes", "noisy", "step"]:
    for lo, hi in [(0.15, 0.4), (0.1, 0.3)]:
        strong, weak, promoted, edges = canny(preset(name), lo, hi)
        print(f"{name}, low {lo} high {hi}: strong {strong}, weak {weak}, promoted {promoted}, dropped {weak - promoted}, edge pixels {edges}")
