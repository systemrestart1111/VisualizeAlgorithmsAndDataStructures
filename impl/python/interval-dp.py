STONES = [4, 1, 2, 3, 5, 2]

# 石子合併：每次合併相鄰兩堆，成本為兩堆重量和
# dp[i][j] = 把第 i..j 堆合成一堆的最小成本 = min(dp[i][k] + dp[k+1][j]) + sum(i..j)
n = len(STONES)
pre = [0]
for x in STONES:
    pre.append(pre[-1] + x)
dp = [[0] * n for _ in range(n)]
cut = [[0] * n for _ in range(n)]
for length in range(2, n + 1):
    for i in range(n - length + 1):
        j = i + length - 1
        dp[i][j] = min(dp[i][k] + dp[k + 1][j] for k in range(i, j)) + pre[j + 1] - pre[i]
        cut[i][j] = min(range(i, j), key=lambda k: dp[i][k] + dp[k + 1][j])


def show(i, j):
    return str(STONES[i]) if i == j else f"({show(i, cut[i][j])}+{show(cut[i][j] + 1, j)})"


print("min cost =", dp[0][n - 1])
print("merge order:", show(0, n - 1))
