class PM:
    def __init__(self, seed):
        self.s = seed

    def next(self):
        self.s = self.s * 48271 % 2147483647
        return self.s

    def real(self):
        return self.next() / 2147483647


def data():
    g = PM(9)
    return [(0.5 + i * 0.8, 2 * (0.5 + i * 0.8) + 1 + (g.real() - 0.5) * 4) for i in range(12)]


def mse(P, w, b):
    return sum((w * x + b - y) ** 2 for x, y in P) / len(P)


def sgd(P, lr, epochs, seed):
    """每輪先 Fisher–Yates 洗牌，再逐筆更新：w −= η·2e·x，b −= η·2e"""
    g, w, b = PM(seed), 0.0, 0.0
    for ep in range(1, epochs + 1):
        order = list(range(len(P)))
        for i in range(len(P) - 1, 0, -1):
            j = g.next() % (i + 1)
            order[i], order[j] = order[j], order[i]
        for i in order:
            x, y = P[i]
            e = w * x + b - y
            w -= lr * 2 * e * x
            b -= lr * 2 * e
        if mse(P, w, b) > 1e6:
            return None, ep
    return (w, b), epochs


def batch(P, lr, epochs):
    n, w, b = len(P), 0.0, 0.0
    for _ in range(epochs):
        gw = sum(2 / n * (w * x + b - y) * x for x, y in P)
        gb = sum(2 / n * (w * x + b - y) for x, y in P)
        w, b = w - lr * gw, b - lr * gb
    return w, b


P = data()
for lr in [0.01, 0.002, 0.03]:
    res, ep = sgd(P, lr, 15, 42)
    bw, bb = batch(P, lr, 15)
    s = f"diverged at epoch {ep}" if res is None else f"w = {res[0]:.4f}, b = {res[1]:.4f}, MSE {mse(P, *res):.4f}"
    print(f"lr {lr}, 15 epochs: SGD {s}; batch GD w = {bw:.4f}, b = {bb:.4f}, MSE {mse(P, bw, bb):.4f}")
