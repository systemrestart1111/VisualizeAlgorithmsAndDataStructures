def ternary_search_peak(a):
    """a 先升後降（單峰）；每次取兩個三等分點，捨棄不可能含峰值的那一段"""
    lo, hi = 0, len(a) - 1
    while hi - lo > 2:
        m1 = lo + (hi - lo) // 3
        m2 = hi - (hi - lo) // 3
        if a[m1] < a[m2]:
            lo = m1 + 1
        else:
            hi = m2 - 1
    return max(range(lo, hi + 1), key=lambda i: a[i])


a = [3, 9, 14, 22, 31, 40, 52, 47, 38, 26, 17, 11, 5]
p = ternary_search_peak(a)
print("peak index =", p, "value =", a[p])
