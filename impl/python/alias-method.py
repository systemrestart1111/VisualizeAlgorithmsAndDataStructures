class PM:
    def __init__(self, seed):
        self.s = seed

    def next(self):
        self.s = self.s * 48271 % 2147483647
        return self.s


def build(W):
    """Vose 別名法：縮放成平均 1，矮欄用高欄補滿，每欄最多兩個選項"""
    if any(w < 0 for w in W):
        raise ValueError("weights must be non-negative")
    total = sum(W)
    if total <= 0:
        raise ValueError("total weight must be positive")
    n = len(W)
    p = [w / total * n for w in W]
    prob, alias = [0.0] * n, [-1] * n
    small = [i for i in range(n) if p[i] < 1]
    large = [i for i in range(n) if p[i] >= 1]
    while small and large:
        s, l = small.pop(), large.pop()
        prob[s], alias[s] = p[s], l
        p[l] -= 1 - p[s]
        (small if p[l] < 1 else large).append(l)
    for i in small + large:
        prob[i], alias[i] = 1.0, i
    return prob, alias


def sample(prob, alias, g):
    """隨機選一欄，再擲硬幣決定取本身或別名：O(1)"""
    i = g.next() % len(prob)
    return i if g.next() / 2147483647 < prob[i] else alias[i]


for W in [[5, 1, 3, 1, 8, 2], [0, 3, 0, 1], [1, 1, 1, 1], [7]]:
    prob, alias = build(W)
    g, N = PM(7), 10000
    cnt = [0] * len(W)
    for _ in range(N):
        cnt[sample(prob, alias, g)] += 1
    total = sum(W)
    chi = sum((c - w / total * N) ** 2 / (w / total * N) for c, w in zip(cnt, W) if w > 0)
    print(f"weights {W}: prob {' '.join(f'{p:.4f}' for p in prob)}, alias {' '.join(map(str, alias))}, counts {' '.join(map(str, cnt))}, chi-square {chi:.3f}")
for W in [[1, -1], [0, 0]]:
    try:
        build(W)
    except ValueError as e:
        print(f"weights {W}: {e}")
