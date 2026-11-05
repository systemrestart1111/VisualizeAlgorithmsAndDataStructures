def lower_bound(a, t):
    """第一個 >= t 的位置"""
    lo, hi = 0, len(a)
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] < t:
            lo = mid + 1
        else:
            hi = mid
    return lo


def upper_bound(a, t):
    """第一個 > t 的位置"""
    lo, hi = 0, len(a)
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] <= t:
            lo = mid + 1
        else:
            hi = mid
    return lo


a = [2, 4, 4, 4, 7, 9, 9, 12, 15, 15, 15, 18]
lb, ub = lower_bound(a, 9), upper_bound(a, 9)
print("lower_bound(9) =", lb)
print("upper_bound(9) =", ub)
print("count of 9 =", ub - lb)
