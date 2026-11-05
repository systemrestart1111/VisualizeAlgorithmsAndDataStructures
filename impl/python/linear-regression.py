class PM:
    def __init__(self, seed):
        self.s = seed

    def real(self):
        self.s = self.s * 48271 % 2147483647
        return self.s / 2147483647


def data(exact, seed=42):
    g, pts = PM(seed), []
    for i in range(12):
        x = 0.5 + i * 0.8
        pts.append((x, 2 * x + 1 if exact else 2 * x + 1 + (g.real() - 0.5) * 4))
    return pts


def closed_form(P):
    """正規方程：w = (nΣxy − ΣxΣy) / (nΣx² − (Σx)²)，b = (Σy − wΣx) / n"""
    n = len(P)
    sx = sum(x for x, _ in P)
    sy = sum(y for _, y in P)
    sxx = sum(x * x for x, _ in P)
    sxy = sum(x * y for x, y in P)
    w = (n * sxy - sx * sy) / (n * sxx - sx * sx)
    return w, (sy - w * sx) / n


def mse(P, w, b):
    return sum((w * x + b - y) ** 2 for x, y in P) / len(P)


def gradient_descent(P, lr, epochs):
    """沿 ∂MSE/∂w = (2/n)Σe·x、∂MSE/∂b = (2/n)Σe 的反方向更新"""
    n, w, b = len(P), 0.0, 0.0
    for ep in range(1, epochs + 1):
        gw = gb = 0.0
        for x, y in P:
            e = w * x + b - y
            gw += 2 / n * e * x
            gb += 2 / n * e
        w -= lr * gw
        b -= lr * gb
        if mse(P, w, b) > 1e6:
            return None, ep
    return (w, b), epochs


for exact in [False, True]:
    P = data(exact)
    w, b = closed_form(P)
    print(f"{'exact' if exact else 'noisy'} data: closed form w = {w:.4f}, b = {b:.4f}, MSE = {mse(P, w, b):.4f}")
    for lr, epochs in [(0.02, 200), (0.02, 2000), (0.005, 200), (0.05, 200)]:
        res, ep = gradient_descent(P, lr, epochs)
        if res is None:
            print(f"  lr {lr}: diverged at epoch {ep}")
        else:
            print(f"  lr {lr}, {epochs} epochs: w = {res[0]:.4f}, b = {res[1]:.4f}, MSE = {mse(P, *res):.4f}")
