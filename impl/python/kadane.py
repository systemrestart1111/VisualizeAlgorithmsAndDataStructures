def kadane(a):
    """以 i 結尾的最大和 = max(a[i], 前一個的最大和 + a[i])；同時記錄區間"""
    best, cur = a[0], a[0]
    start = best_l = best_r = 0
    for i in range(1, len(a)):
        if cur < 0:
            cur, start = a[i], i
        else:
            cur += a[i]
        if cur > best:
            best, best_l, best_r = cur, start, i
    return best, best_l, best_r


a = [-2, 1, -3, 4, -1, 2, 1, -5, 4, 3, -2, 2]
s, l, r = kadane(a)
print(f"max sum = {s}, range [{l}, {r}]")
