N = 16


def preset(name):
    if name == "flat":
        return [[120] * N for _ in range(N)]
    a = [[30] * N for _ in range(N)]
    for r in range(N):
        for c in range(N):
            if 2 <= r <= 6 and 2 <= c <= 7:
                a[r][c] = 200
            if (r - 10.5) ** 2 + (c - 10.5) ** 2 <= 12.96:
                a[r][c] = 140
            if 9 <= r <= 14 and 1 <= c <= r - 8:
                a[r][c] = 90
    if name == "lowcontrast":
        a = [[95 + int(round((a[r][c] - 30) / 170 * 35)) + (r // 4) * 3 for c in range(N)] for r in range(N)]
    return a


def equalize(A):
    """map[v] = round((CDF[v] − CDF_min) / (N − CDF_min) × 255)；常數影像原樣輸出"""
    hist = [0] * 256
    for row in A:
        for v in row:
            hist[v] += 1
    cdf, s = [], 0
    for h in hist:
        s += h
        cdf.append(s)
    cmin = next(c for c in cdf if c > 0)
    if cmin == N * N:
        return None, hist
    return [int((cdf[v] - cmin) * 255 / (N * N - cmin) + 0.5) for v in range(256)], hist


for name in ["lowcontrast", "shapes", "flat"]:
    m, hist = equalize(preset(name))
    used = [v for v in range(256) if hist[v]]
    if m is None:
        print(f"{name}: constant image, unchanged")
    else:
        print(f"{name}: " + " ".join(f"{v}->{m[v]}" for v in used))
