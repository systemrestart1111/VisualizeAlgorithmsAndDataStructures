ITEMS = [(2, 3, 3), (3, 4, 2), (4, 6, 4)]  # (重量, 價值, 數量)
W = 12

# 二進位拆分：數量 c 拆成 1, 2, 4, …, 餘數 這幾包，任意 0..c 件都能由它們組合出來，之後當成 0/1 背包
pieces = []
for w, v, c in ITEMS:
    k = 1
    while c > 0:
        take = min(k, c)
        pieces.append((w * take, v * take))
        c -= take
        k *= 2
print("pieces:", " ".join(f"({w},{v})" for w, v in pieces))

dp = [0] * (W + 1)
for pw, pv in pieces:
    for w in range(W, pw - 1, -1):  # 0/1 背包：容量由大到小，避免同一包被用兩次
        dp[w] = max(dp[w], dp[w - pw] + pv)
print("best value =", dp[W])
