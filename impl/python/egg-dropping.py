def min_drops(k, n):
    """f(m, e) = f(m−1, e−1) + f(m−1, e) + 1：m 次、e 顆蛋最多能區分的樓層數"""
    if n == 0:
        return 0
    f = [0] * (k + 1)
    m = 0
    while f[k] < n:
        m += 1
        for e in range(k, 0, -1):  # 由大到小更新，f[e−1] 仍是上一輪的值
            f[e] = f[e - 1] + f[e] + 1
    return m


for k, n in [(2, 36), (1, 10), (3, 100), (2, 0), (2, 100), (4, 5000)]:
    print(f"{k} eggs, {n} floors: {min_drops(k, n)} drops")
