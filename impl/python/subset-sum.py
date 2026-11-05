A = [3, 34, 4, 12, 5, 2]
T = 9

# dp[i][s] = 前 i 個數能否湊出 s = dp[i-1][s] or dp[i-1][s - a[i]]
n = len(A)
dp = [[False] * (T + 1) for _ in range(n + 1)]
dp[0][0] = True
for i in range(1, n + 1):
    for s in range(T + 1):
        dp[i][s] = dp[i - 1][s] or (s >= A[i - 1] and dp[i - 1][s - A[i - 1]])
print("possible =", dp[n][T])
if dp[n][T]:
    pick, s = [], T
    for i in range(n, 0, -1):  # 若不用第 i 個就湊不出來，代表一定要用它
        if not dp[i - 1][s]:
            pick.append(A[i - 1])
            s -= A[i - 1]
    print("subset:", *reversed(pick))
