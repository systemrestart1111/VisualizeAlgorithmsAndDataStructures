from bisect import bisect_right

IV = [(0, 3, 2), (2, 9, 20), (3, 5, 3), (5, 7, 4), (7, 10, 3), (9, 12, 6), (10, 14, 2)]


def schedule(iv):
    """依結束時間排序；dp[j] = max(dp[j−1], w_j + dp[p(j)])，p(j) 以二分搜尋找最後一個相容活動"""
    s = sorted(iv, key=lambda x: (x[1], x[0]))
    ends = [x[1] for x in s]
    p = [bisect_right(ends, x[0]) for x in s]  # 前 p 個活動都與它相容
    dp = [0] * (len(s) + 1)
    for j in range(1, len(s) + 1):
        dp[j] = max(dp[j - 1], s[j - 1][2] + dp[p[j - 1]])
    pick, j = [], len(s)
    while j > 0:
        if dp[j] != dp[j - 1]:
            pick.append(s[j - 1])
            j = p[j - 1]
        else:
            j -= 1
    return dp[-1], pick[::-1]


best, pick = schedule(IV)
print("best total:", best, "chosen:", " ".join(f"[{a},{b})w{w}" for a, b, w in pick))
last, greedy = float("-inf"), 0
for a, b, w in sorted(IV, key=lambda x: (x[1], x[0])):
    if a >= last:
        greedy += w
        last = b
print("earliest-finish greedy:", greedy)
