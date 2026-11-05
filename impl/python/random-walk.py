import math

state = 42


def rand_int(k):
    """Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1"""
    global state
    state = state * 48271 % 2147483647
    return state % k


# 二維隨機漫步：每步等機率往上下左右走一格；n 步後離原點的距離期望值約為 √n
DIRS = [(1, 0), (0, 1), (-1, 0), (0, -1)]
x = y = 0
far = 0
for step in range(1, 401):
    dx, dy = DIRS[rand_int(4)]
    x, y = x + dx, y + dy
    far = max(far, x * x + y * y)
    if step in (100, 200, 400):
        print(f"step {step}: position ({x}, {y}), distance = {math.sqrt(x * x + y * y):.4f}")
print(f"farthest distance = {math.sqrt(far):.4f}, sqrt(n) = {math.sqrt(400):.4f}")
