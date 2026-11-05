def f(x):
    return x * x


def df(x):
    return 2 * x


x0 = 1.0
print(f"exact f'({x0:.1f}) = {df(x0):.6f}")
h = 1.0
for _ in range(6):
    forward = (f(x0 + h) - f(x0)) / h
    central = (f(x0 + h) - f(x0 - h)) / (2 * h)
    print(f"h = {h:.5f}  forward = {forward:.6f}  central = {central:.6f}  error = {abs(forward - df(x0)):.6f}")
    h /= 2
# 多變數：g(x, y) = x^2 + 2y^2 的梯度 (2x, 4y)
gx, gy, eps = 1.0, 1.0, 1e-3
g = lambda x, y: x * x + 2 * y * y
print(f"grad g(1,1) analytic = (2.000, 4.000), numeric = ({(g(gx + eps, gy) - g(gx - eps, gy)) / (2 * eps):.3f}, {(g(gx, gy + eps) - g(gx, gy - eps)) / (2 * eps):.3f})")
