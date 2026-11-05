import math


def simpson(f, a, b, n):
    """係數 1, 4, 2, 4, …, 2, 4, 1 乘 h/3；n 必須是偶數"""
    if n % 2:
        return None
    h = (b - a) / n
    s = f(a) + f(b)
    for i in range(1, n):
        s += (4 if i % 2 else 2) * f(a + i * h)
    return s * h / 3


def trapezoid(f, a, b, n):
    h = (b - a) / n
    return (f(a) + f(b)) / 2 * h + sum(f(a + i * h) for i in range(1, n)) * h


tests = [
    ("sin x on [0, pi]", math.sin, 0, math.pi, 2.0),
    ("4/(1+x^2) on [0, 1]", lambda x: 4 / (1 + x * x), 0, 1, math.pi),
    ("x^3-2x+1 on [0, 2]", lambda x: x ** 3 - 2 * x + 1, 0, 2, 2.0),
    ("sqrt x on [0, 1]", math.sqrt, 0, 1, 2 / 3),
]
for name, f, a, b, exact in tests:
    for n in [2, 6, 12, 24]:
        s = simpson(f, a, b, n)
        print(f"{name}, n = {n}: simpson {s:.10f} (err {abs(s - exact):.10f}), trapezoid err {abs(trapezoid(f, a, b, n) - exact):.10f}")
print("n = 5:", "n must be even" if simpson(math.sin, 0, 1, 5) is None else "ok")
