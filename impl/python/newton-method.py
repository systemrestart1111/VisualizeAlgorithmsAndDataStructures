f = lambda x: x ** 3 - 2 * x - 5
df = lambda x: 3 * x * x - 2

# 用切線逼近：x ← x − f(x) / f'(x)；靠近根時誤差每步大約平方縮小（二次收斂）
x = 3.0
print(f"x0 = {x:.10f}")
for i in range(1, 7):
    x -= f(x) / df(x)
    print(f"x{i} = {x:.10f}")
