COINS = [1, 3, 4]
A = 10
INF = float("inf")

# 最少硬幣數：dp[a] = min(dp[a - c] + 1)；記下每個金額最後用的硬幣以便還原
dp, last = [0] + [INF] * A, [0] * (A + 1)
for a in range(1, A + 1):
    for c in COINS:
        if a >= c and dp[a - c] + 1 < dp[a]:
            dp[a], last[a] = dp[a - c] + 1, c
used, a = [], A
while a > 0:
    used.append(last[a])
    a -= last[a]
print("min coins =", dp[A], "->", *used)

# 組合數：外層跑硬幣、內層跑金額，每種組合只會以固定的硬幣順序被數到一次
ways = [1] + [0] * A
for c in COINS:
    for a in range(c, A + 1):
        ways[a] += ways[a - c]
print("ways =", ways[A])
