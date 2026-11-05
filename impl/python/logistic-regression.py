import math


class PM:
    def __init__(self, seed):
        self.s = seed

    def real(self):
        self.s = self.s * 48271 % 2147483647
        return self.s / 2147483647


def data(seed, sep):
    g, D = PM(seed), []
    for i in range(24):
        y = i % 2
        c = 6 if y else 3
        x1 = c + (g.real() - 0.5) * sep
        x2 = c + (g.real() - 0.5) * sep
        D.append((x1, x2, y))
    return D


def sigmoid(z):
    """依正負號選擇不會溢位的寫法"""
    return 1 / (1 + math.exp(-z)) if z >= 0 else math.exp(z) / (1 + math.exp(z))


def log_loss(z, y):
    """交叉熵的穩定形式：max(z, 0) − y·z + log(1 + e^(−|z|))，不會出現 log(0)"""
    return max(z, 0) - y * z + math.log1p(math.exp(-abs(z)))


def train(D, lr, epochs):
    n, w1, w2, b = len(D), 0.0, 0.0, 0.0
    for _ in range(epochs):
        g1 = g2 = gb = 0.0
        for x1, x2, y in D:
            e = sigmoid(w1 * x1 + w2 * x2 + b) - y
            g1 += e * x1 / n
            g2 += e * x2 / n
            gb += e / n
        w1 -= lr * g1
        w2 -= lr * g2
        b -= lr * gb
    loss = sum(log_loss(w1 * x1 + w2 * x2 + b, y) for x1, x2, y in D) / n
    acc = sum(1 for x1, x2, y in D if (1 if sigmoid(w1 * x1 + w2 * x2 + b) >= 0.5 else 0) == y)
    return w1, w2, b, loss, acc


print(f"stable loss for z = 40, y = 0: {log_loss(40, 0):.4f}; for z = -40, y = 1: {log_loss(-40, 1):.4f}; z = 0: {log_loss(0, 1):.4f}")
for sep, configs in [(3, [(0.5, 300), (0.1, 300), (0.5, 3000)]), (6, [(0.1, 300), (0.1, 3000), (0.02, 3000)])]:
    D = data(42, sep)
    for lr, epochs in configs:
        w1, w2, b, loss, acc = train(D, lr, epochs)
        print(f"spread {sep}, lr {lr}, {epochs} epochs: w = ({w1:.3f}, {w2:.3f}), b = {b:.3f}, loss {loss:.4f}, accuracy {acc}/24")
