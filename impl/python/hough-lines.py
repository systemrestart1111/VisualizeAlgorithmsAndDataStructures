import math

N = 16


def lines():
    a = [[0] * N for _ in range(N)]
    for c in range(1, 15):
        a[4][c] = 1
    for k in range(1, 15):
        a[15 - k][k] = 1
    for r in range(7, 16):
        a[r][12] = 1
    return a


def hough(E, thr):
    """每個邊緣點對 θ = 0°, 3°, …, 177° 投票給 ρ = round(x cos θ + y sin θ)；取 5×5 鄰域內的峰值"""
    D = math.ceil(math.hypot(N, N))
    TH = 60
    acc = [[0] * TH for _ in range(2 * D + 1)]
    cs = [math.cos(math.radians(t * 3)) for t in range(TH)]
    sn = [math.sin(math.radians(t * 3)) for t in range(TH)]
    pts = [(x, y) for y in range(N) for x in range(N) if E[y][x]]
    for x, y in pts:
        for t in range(TH):
            acc[math.floor(x * cs[t] + y * sn[t] + 0.5) + D][t] += 1
    peaks = []
    for i in range(2 * D + 1):
        for t in range(TH):
            if acc[i][t] < thr:
                continue
            ok = True
            for a in range(-2, 3):
                for b in range(-2, 3):
                    if a == 0 and b == 0:
                        continue
                    y, tt = i + a, (t + b) % TH
                    yy = 2 * D - y if t + b < 0 or t + b >= TH else y
                    if 0 <= yy <= 2 * D and (acc[yy][tt] > acc[i][t] or (acc[yy][tt] == acc[i][t] and (a < 0 or (a == 0 and b < 0)))):
                        ok = False
            if ok:
                peaks.append((t * 3, i - D, acc[i][t]))
    return len(pts), peaks


for thr in [8, 12]:
    n, peaks = hough(lines(), thr)
    print(f"{n} edge points, threshold {thr}: " + "; ".join(f"theta {t}, rho {rho}, votes {v}" for t, rho, v in peaks))
