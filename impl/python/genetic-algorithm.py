ITEMS = [(12, 4), (2, 2), (1, 1), (4, 10), (1, 2), (6, 7), (3, 5), (5, 8), (9, 9), (7, 6), (8, 11), (2, 3)]
CAP = 25


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


weight = lambda c: sum(b * w for b, (w, _) in zip(c, ITEMS))
value = lambda c: sum(b * v for b, (_, v) in zip(c, ITEMS))
BY_RATIO = sorted(range(len(ITEMS)), key=lambda i: (ITEMS[i][1] / ITEMS[i][0], i))


def repair(c):
    """超重時依價值重量比由差到好拿掉物品，保持可行"""
    for i in BY_RATIO:
        if weight(c) <= CAP:
            break
        c[i] = 0
    return c


def best_of(pop):
    best = pop[0]
    for c in pop[1:]:
        if value(c) > value(best):
            best = c
    return best


def genetic(seed, gens, pm, size=16):
    """錦標賽選擇（3 取 1）、單點交配、位元突變、菁英保留"""
    g, n = PM(seed), len(ITEMS)
    pop = [repair([g.int(2) for _ in range(n)]) for _ in range(size)]

    def tour():
        b = pop[g.int(size)]
        for _ in range(2):
            c = pop[g.int(size)]
            if value(c) > value(b):
                b = c
        return b

    for _ in range(gens):
        nxt = [best_of(pop)[:]]
        while len(nxt) < size:
            a, b = tour(), tour()
            cut = 1 + g.int(n - 1)
            child = [1 - bit if g.real() < pm else bit for bit in a[:cut] + b[cut:]]
            nxt.append(repair(child))
        pop = nxt
    return best_of(pop)


dp = [0] * (CAP + 1)
for w, v in ITEMS:
    for c in range(CAP, w - 1, -1):
        dp[c] = max(dp[c], dp[c - w] + v)
print(f"dynamic programming optimum: {dp[CAP]}")
for seed, gens, pm in [(4, 30, 0.05), (4, 80, 0.05), (9, 30, 0.01), (2, 30, 0.2)]:
    best = genetic(seed, gens, pm)
    print(f"seed {seed}, {gens} generations, mutation {pm}: best {''.join(map(str, best))}, weight {weight(best)}, value {value(best)}")
