import math

FUNCS = {
    "ellipse": (lambda x, y: 0.1 * x * x + 2 * y * y, lambda x, y: (0.2 * x, 4 * y), (-4.0, 1.5)),
    "rosenbrock": (lambda x, y: (1 - x) ** 2 + 10 * (y - x * x) ** 2, lambda x, y: (-2 * (1 - x) - 40 * x * (y - x * x), 20 * (y - x * x)), (-1.5, 2.0)),
}


def adam(name, lr, steps):
    """m、v 為梯度與梯度平方的移動平均；偏差修正後 θ −= η·m̂ / (√v̂ + ε)（ε 在根號外）"""
    f, grad, start = FUNCS[name]
    b1, b2, eps = 0.9, 0.999, 1e-8
    th, m, v = list(start), [0.0, 0.0], [0.0, 0.0]
    first = None
    for t in range(1, steps + 1):
        g = grad(*th)
        for i in range(2):
            m[i] = b1 * m[i] + (1 - b1) * g[i]
            v[i] = b2 * v[i] + (1 - b2) * g[i] ** 2
            mh = m[i] / (1 - b1 ** t)
            vh = v[i] / (1 - b2 ** t)
            step = lr * mh / (math.sqrt(vh) + eps)
            if t == 1 and i == 0:
                first = (g[0], mh, vh, step)
            th[i] -= step
    return th, f(*th), first


def gd(name, lr, steps):
    f, grad, start = FUNCS[name]
    th = list(start)
    for _ in range(steps):
        g = grad(*th)
        th = [th[0] - lr * g[0], th[1] - lr * g[1]]
        if abs(th[0]) > 1e6 or abs(th[1]) > 1e6:
            return None
    return th, f(*th)


for name in ["ellipse", "rosenbrock"]:
    for lr, steps in [(0.1, 150), (0.03, 150)]:
        th, fv, (g0, mh, vh, step) = adam(name, lr, steps)
        print(f"{name}, lr {lr}: first step g = {g0:.4f}, m_hat = {mh:.4f}, v_hat = {vh:.4f}, step = {step:.4f}; after {steps} steps theta = ({th[0]:.4f}, {th[1]:.4f}), f = {fv:.6f}")
        res = gd(name, lr, steps)
        print("  plain gradient descent: " + ("diverged" if res is None else f"theta = ({res[0][0]:.4f}, {res[0][1]:.4f}), f = {res[1]:.6f}"))
