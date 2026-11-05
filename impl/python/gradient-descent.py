f = lambda x: (x - 2) ** 2 + 1  # 最小值在 x = 2
df = lambda x: 2 * (x - 2)

# 沿負梯度方向前進：x ← x − η·f'(x)；η 太大會震盪甚至發散，太小則收斂很慢
x, lr = 5.5, 0.1
print(f"step  0: x = {x:.6f}, f(x) = {f(x):.6f}")
for step in range(1, 21):
    x -= lr * df(x)
    if step <= 5 or step % 5 == 0:
        print(f"step {step:2d}: x = {x:.6f}, f(x) = {f(x):.6f}")
