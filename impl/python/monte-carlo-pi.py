state = 42


def rand_int(k):
    """Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1"""
    global state
    state = state * 48271 % 2147483647
    return state % k


# 在邊長 R 的正方形內隨機撒點，落在四分之一圓內的比例 ≈ π/4（座標用整數，避免浮點誤差）
R, N = 100000, 2000
inside = 0
for i in range(1, N + 1):
    x, y = rand_int(R), rand_int(R)
    if x * x + y * y < R * R:
        inside += 1
    if i in (100, 500, 1000, 2000):
        print(f"n = {i:4d}: pi ~ {4 * inside / i:.4f}")
