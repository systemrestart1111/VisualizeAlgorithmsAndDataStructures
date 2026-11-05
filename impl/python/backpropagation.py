import math

XOR = [(0, 0, 0), (0, 1, 1), (1, 0, 1), (1, 1, 0)]


class PM:
    def __init__(self, seed):
        self.s = seed

    def real(self):
        self.s = self.s * 48271 % 2147483647
        return self.s / 2147483647


def sg(z):
    return 1 / (1 + math.exp(-z))


def forward(t, x):
    """2-2-1 網路：參數 W1(4) b1(2) w2(2) b2(1)"""
    h = [sg(t[0] * x[0] + t[1] * x[1] + t[4]), sg(t[2] * x[0] + t[3] * x[1] + t[5])]
    return h, sg(t[6] * h[0] + t[7] * h[1] + t[8])


def loss(t):
    return sum(0.5 * (forward(t, (a, b))[1] - y) ** 2 for a, b, y in XOR)


def grad(t):
    """連鎖律由輸出往回：δ₂ = (ŷ − y)ŷ(1 − ŷ)，δ₁ = w₂δ₂ ⊙ h(1 − h)"""
    G = [0.0] * 9
    for a, b, y in XOR:
        h, o = forward(t, (a, b))
        d2 = (o - y) * o * (1 - o)
        G[6] += d2 * h[0]
        G[7] += d2 * h[1]
        G[8] += d2
        d1 = [t[6] * d2 * h[0] * (1 - h[0]), t[7] * d2 * h[1] * (1 - h[1])]
        G[0] += d1[0] * a
        G[1] += d1[0] * b
        G[2] += d1[1] * a
        G[3] += d1[1] * b
        G[4] += d1[0]
        G[5] += d1[1]
    return G


for seed, lr, epochs in [(3, 2.0, 2000), (1, 2.0, 2000), (3, 0.5, 2000)]:
    g = PM(seed)
    t = [(g.real() - 0.5) * 2 for _ in range(9)]
    G, eps = grad(t), 1e-5
    rel = []
    for i in range(9):
        p, m = t[:], t[:]
        p[i] += eps
        m[i] -= eps
        num = (loss(p) - loss(m)) / (2 * eps)
        rel.append(abs(G[i] - num) / max(1e-12, abs(G[i]) + abs(num)))
    print(f"seed {seed}: initial loss {loss(t):.6f}, gradient check max relative error < 1e-6: {max(rel) < 1e-6}")
    for _ in range(epochs):
        gr = grad(t)
        t = [v - lr * gr[i] for i, v in enumerate(t)]
    preds = [forward(t, (a, b))[1] for a, b, _ in XOR]
    print(f"  lr {lr}, {epochs} epochs: loss {loss(t):.6f}, predictions {' '.join(f'{p:.3f}' for p in preds)}, all correct {all((p >= 0.5) == (y == 1) for p, (_, _, y) in zip(preds, XOR))}")
