P = [30, 35, 15, 5, 10, 20, 25]  # 矩陣 i 的大小為 P[i-1] x P[i]
n = len(P) - 1
INF = float("inf")

# m[i][j] = 計算 A_i..A_j 的最少純量乘法數；枚舉最後一次相乘的切點 k
m = [[0] * (n + 1) for _ in range(n + 1)]
s = [[0] * (n + 1) for _ in range(n + 1)]
for length in range(2, n + 1):
    for i in range(1, n - length + 2):
        j = i + length - 1
        m[i][j] = INF
        for k in range(i, j):
            cost = m[i][k] + m[k + 1][j] + P[i - 1] * P[k] * P[j]
            if cost < m[i][j]:
                m[i][j], s[i][j] = cost, k


def paren(i, j):
    return f"A{i}" if i == j else f"({paren(i, s[i][j])}{paren(s[i][j] + 1, j)})"


print("min multiplications =", m[1][n])
print("order:", paren(1, n))
