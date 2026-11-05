from collections import deque


def frog(x, C):
    """dp[i] = min_j dp[j] + (x_i − x_j)² + C；直線 y = −2x_j·X + dp[j] + x_j²，斜率遞減、查詢遞增"""
    n = len(x)
    dp = [0] * n
    dq = deque([(-2 * x[0], x[0] * x[0])])
    f = lambda l, X: l[0] * X + l[1]
    bad = lambda l1, l2, l3: (l3[1] - l1[1]) * (l1[0] - l2[0]) <= (l2[1] - l1[1]) * (l1[0] - l3[0])
    for i in range(1, n):
        while len(dq) >= 2 and f(dq[1], x[i]) <= f(dq[0], x[i]):
            dq.popleft()
        dp[i] = f(dq[0], x[i]) + x[i] * x[i] + C
        L = (-2 * x[i], dp[i] + x[i] * x[i])
        while len(dq) >= 2 and bad(dq[-2], dq[-1], L):
            dq.pop()
        dq.append(L)
    return dp


def naive(x, C):
    dp = [0] + [float("inf")] * (len(x) - 1)
    for i in range(1, len(x)):
        dp[i] = min(dp[j] + (x[i] - x[j]) ** 2 + C for j in range(i))
    return dp


x = [1, 3, 4, 7, 8, 11, 12, 15]
for C in (10, 0, 100):
    dp = frog(x, C)
    print(f"C = {C}: dp = {' '.join(map(str, dp))} | naive last = {naive(x, C)[-1]}")
