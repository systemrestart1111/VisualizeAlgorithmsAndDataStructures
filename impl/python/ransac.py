import math


class PM:
    def __init__(self, seed):
        self.s = seed

    def next(self):
        self.s = self.s * 48271 % 2147483647
        return self.s

    def int(self, n):
        return self.next() % n

    def real(self):
        return self.next() / 2147483647


def data():
    g, pts = PM(7), []
    for i in range(20):
        x = 0.5 + i * 9 / 19
        pts.append((x, 0.6 * x + 2 + (g.real() - 0.5) * 0.6))
    for _ in range(10):
        x = g.real() * 10
        pts.append((x, g.real() * 10))
    return pts


def lsq(P):
    n = len(P)
    sx = sum(p[0] for p in P)
    sy = sum(p[1] for p in P)
    sxx = sum(p[0] * p[0] for p in P)
    sxy = sum(p[0] * p[1] for p in P)
    det = n * sxx - sx * sx
    return ((n * sxy - sx * sy) / det, (sxx * sy - sx * sxy) / det) if det else (0.0, sy / n)


def ransac(P, seed, iters, thr):
    """隨機抽兩點定直線，數誤差門檻內的內點，保留最多者；最後只用內點重新擬合"""
    g, best = PM(seed), None
    for _ in range(iters):
        i, j = g.int(len(P)), g.int(len(P))
        tries = 0
        while P[i] == P[j] and tries < 10:
            j = g.int(len(P))
            tries += 1
        if P[i] == P[j]:
            continue
        (x1, y1), (x2, y2) = P[i], P[j]
        A, B = y2 - y1, x1 - x2
        C, nrm = -(A * x1 + B * y1), math.hypot(A, B)
        inl = [k for k, (x, y) in enumerate(P) if abs(A * x + B * y + C) / nrm < thr]
        if best is None or len(inl) > len(best):
            best = inl
    a, b = lsq([P[k] for k in best])
    return len(best), sum(1 for k in best if k < 20), a, b


P = data()
a0, b0 = lsq(P)
print(f"least squares on all 30 points: y = {a0:.3f}x + {b0:.3f}")
for seed, iters, thr in [(42, 20, 0.5), (1, 5, 0.5), (2024, 50, 0.3), (42, 20, 1.0)]:
    n, real, a, b = ransac(P, seed, iters, thr)
    print(f"seed {seed}, {iters} iterations, threshold {thr}: {n} inliers ({real} true), refit y = {a:.3f}x + {b:.3f}")
