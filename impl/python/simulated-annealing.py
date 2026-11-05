import math
from itertools import permutations


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


def cities(seed, n):
    g = PM(seed)
    return [(g.next() % 1000 / 100, g.next() % 1000 / 100) for _ in range(n)]


def length(C, t):
    return sum(math.sqrt((C[t[i]][0] - C[t[(i + 1) % len(t)]][0]) ** 2 + (C[t[i]][1] - C[t[(i + 1) % len(t)]][1]) ** 2) for i in range(len(t)))


def anneal(C, seed, steps, cool):
    """2-opt 反轉一段；變短必接受，變長以 e^(−Δ/T) 接受；T 每步乘以冷卻率"""
    g, n = PM(seed), len(C)
    tour = list(range(n))
    for i in range(n - 1, 0, -1):
        j = g.int(i + 1)
        tour[i], tour[j] = tour[j], tour[i]
    cur = length(C, tour)
    best, best_tour, T, worse = cur, tour[:], 2.0, 0
    for _ in range(steps):
        i, j = g.int(n), g.int(n)
        if i > j:
            i, j = j, i
        if i == j:
            T *= cool
            continue
        nt = tour[:i] + tour[i:j + 1][::-1] + tour[j + 1:]
        nl = length(C, nt)
        d = nl - cur
        if abs(d) < 1e-9:
            d = 0.0  # 長度相同（例如整條路線反轉）時視為 0，避免不同語言的捨入差異
        if d < 0 or g.real() < math.exp(-d / T):
            if d > 0:
                worse += 1
            tour, cur = nt, nl
            if cur < best - 1e-12:
                best, best_tour = cur, tour[:]
        T *= cool
    return best, worse


def brute(C):
    best = math.inf
    for p in permutations(range(1, len(C))):
        best = min(best, length(C, (0,) + p))
    return best


C = cities(21, 8)
opt = brute(C)
print(f"8 cities, brute-force optimum {opt:.3f}")
for seed, steps, cool in [(7, 2000, 0.997), (7, 300, 0.99), (11, 2000, 0.997), (3, 8000, 0.9995)]:
    best, worse = anneal(C, seed, steps, cool)
    print(f"seed {seed}, {steps} steps, cooling {cool}: best {best:.3f}, gap {100 * (best - opt) / opt:.2f}%, accepted {worse} worse moves")
