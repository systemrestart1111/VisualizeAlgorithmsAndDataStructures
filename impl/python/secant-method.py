import math

FUNCS = {
    "x^3-2x-5": lambda x: x ** 3 - 2 * x - 5,
    "cos x - x": lambda x: math.cos(x) - x,
    "x^2-2": lambda x: x * x - 2,
    "atan x": math.atan,
}


def secant(f, x0, x1):
    """x2 = x1 − f(x1)(x1 − x0) / (f(x1) − f(x0))；分母趨近 0 或 |x| 爆增時停止"""
    for k in range(1, 26):
        f0, f1 = f(x0), f(x1)
        if abs(f1 - f0) < 1e-14:
            return "flat secant (f(x0) = f(x1)), stop"
        x2 = x1 - f1 * (x1 - x0) / (f1 - f0)
        if not math.isfinite(x2) or abs(x2) > 1e6:
            return f"diverged after {k} steps"
        if abs(x2 - x1) < 1e-12:
            return f"root {0.0 if abs(x2) < 5e-11 else x2:.10f} after {k} steps"
        x0, x1 = x1, x2
    return "no convergence in 25 steps"


for name, x0, x1 in [("x^3-2x-5", 1, 3), ("cos x - x", 0, 1), ("x^2-2", 1, 2), ("x^2-2", -1, 1), ("atan x", 1, 2), ("atan x", 3, 5)]:
    print(f"{name}, x0 = {x0}, x1 = {x1}: {secant(FUNCS[name], x0, x1)}")
