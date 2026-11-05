import math


def rk4(f, y0, h, T):
    """每步四個斜率：起點、兩個中點、終點，以 1:2:2:1 加權"""
    t, y = 0.0, y0
    n = round(T / h)
    for k in range(n):
        k1 = f(t, y)
        k2 = f(t + h / 2, y + h * k1 / 2)
        k3 = f(t + h / 2, y + h * k2 / 2)
        k4 = f(t + h, y + h * k3)
        y += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6
        t = (k + 1) * h
    return y


def euler(f, y0, h, T):
    t, y = 0.0, y0
    for k in range(round(T / h)):
        y += h * f(t, y)
        t = (k + 1) * h
    return y


odes = [
    ("y' = y, y(0) = 1", lambda t, y: y, 1.0, 2.0, math.exp(2)),
    ("y' = -2ty, y(0) = 1", lambda t, y: -2 * t * y, 1.0, 2.0, math.exp(-4)),
    ("y' = t - y, y(0) = 1", lambda t, y: t - y, 1.0, 3.0, 3 - 1 + 2 * math.exp(-3)),
]
for name, f, y0, T, exact in odes:
    for h in [0.5, 0.25, 0.1]:
        y, ye = rk4(f, y0, h, T), euler(f, y0, h, T)
        print(f"{name}, h = {h}: y({T:g}) rk4 {y:.8f} (err {abs(y - exact):.8f}), euler {ye:.8f} (err {abs(ye - exact):.8f})")
    e1, e2 = abs(rk4(f, y0, 0.2, T) - exact), abs(rk4(f, y0, 0.1, T) - exact)
    print(f"  halving h from 0.2 to 0.1 shrinks rk4 error by {e1 / e2:.1f}x")
