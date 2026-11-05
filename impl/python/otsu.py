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
    elif name == "step":
        a = [[(60 if c < 8 else 190) + (40 if r >= 11 else 0) for c in range(N)] for r in range(N)]
    elif name == "flat":
        a = [[120] * N for _ in range(N)]
    return a


def otsu(A):
    """最大化類間變異數 ω₀ω₁(μ₀ − μ₁)²；空類別跳過；只有一種灰階時 t = 該灰階"""
    hist = [0] * 256
    for row in A:
        for v in row:
            hist[v] += 1
    total_px = N * N
    levels = [v for v in range(256) if hist[v]]
    if len(levels) == 1:
        return levels[0], None
    total = sum(v * h for v, h in enumerate(hist))
    w0 = sum0 = 0
    best, bt = -1.0, 0
    for t in range(256):
        w0 += hist[t]
        sum0 += hist[t] * t
        w1 = total_px - w0
        if w0 == 0 or w1 == 0:
            continue
        m0, m1 = sum0 / w0, (total - sum0) / w1
        sb = (w0 / total_px) * (w1 / total_px) * (m0 - m1) ** 2
        if sb > best:
            best, bt = sb, t
    return bt, best


for name in ["shapes", "lowcontrast", "step", "flat"]:
    A = preset(name)
    t, sb = otsu(A)
    fg = sum(1 for row in A for v in row if v > t)
    print(f"{name}: " + (f"single gray level, t = {t}, all background" if sb is None else f"t = {t}, between-class variance {sb:.3f}, foreground {fg} pixels"))
