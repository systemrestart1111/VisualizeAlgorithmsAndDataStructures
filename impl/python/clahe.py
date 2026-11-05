N = 16


def preset(name):
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


def rnd(x):
    return int(x + 0.5) if x >= 0 else -int(-x + 0.5)


def clahe(A, T, clip):
    """每格直方圖裁切上限後平均分回（總數不變），各自求對應表，再以雙線性內插消除接縫"""
    ts = N // T
    P = ts * ts
    limit = max(1, -(-clip * P // 256))
    maps, totals_ok = [], True
    for ti in range(T):
        maps.append([])
        for tj in range(T):
            h = [0] * 256
            for i in range(ts):
                for j in range(ts):
                    h[A[ti * ts + i][tj * ts + j]] += 1
            excess = sum(max(0, v - limit) for v in h)
            h = [min(v, limit) for v in h]
            each, rem = divmod(excess, 256)
            h = [v + each + (1 if i < rem else 0) for i, v in enumerate(h)]
            totals_ok &= sum(h) == P
            s, m = 0, []
            for v in h:
                s += v
                m.append(rnd(s * 255 / P))
            maps[ti].append(m)
    no = [[maps[r // ts][c // ts][A[r][c]] for c in range(N)] for r in range(N)]
    out = [[0] * N for _ in range(N)]
    for r in range(N):
        for c in range(N):
            fy, fx = (r + 0.5) / ts - 0.5, (c + 0.5) / ts - 0.5
            y0 = max(0, min(T - 1, int(fy // 1)))
            x0 = max(0, min(T - 1, int(fx // 1)))
            y1, x1 = min(T - 1, y0 + 1), min(T - 1, x0 + 1)
            wy, wx = max(0.0, min(1.0, fy - y0)), max(0.0, min(1.0, fx - x0))
            v = A[r][c]
            out[r][c] = rnd((1 - wy) * ((1 - wx) * maps[y0][x0][v] + wx * maps[y0][x1][v]) + wy * ((1 - wx) * maps[y1][x0][v] + wx * maps[y1][x1][v]))
    seam = lambda a: sum(abs(a[i][k * ts] - a[i][k * ts - 1]) + abs(a[k * ts][i] - a[k * ts - 1][i]) for k in range(1, T) for i in range(N))
    return limit, totals_ok, seam(no), seam(out), sum(map(sum, out))


for name in ["lowcontrast", "shapes"]:
    for T, clip in [(2, 8), (4, 4), (2, 32)]:
        limit, ok, s1, s2, total = clahe(preset(name), T, clip)
        print(f"{name}, {T}x{T} tiles, clip {clip}: limit {limit}, totals preserved {ok}, seam without/with interpolation {s1}/{s2}, output sum {total}")
