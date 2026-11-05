def interpolation_search(a, t):
    """a 已排序且分布均勻；依數值比例估計位置，而不是取中間"""
    lo, hi = 0, len(a) - 1
    while lo <= hi and a[lo] <= t <= a[hi]:
        if a[hi] == a[lo]:
            pos = lo
        else:
            pos = lo + (t - a[lo]) * (hi - lo) // (a[hi] - a[lo])
        if a[pos] == t:
            return pos
        if a[pos] < t:
            lo = pos + 1
        else:
            hi = pos - 1
    return -1


a = [10, 14, 19, 26, 27, 31, 33, 35, 42, 44, 51, 58, 63, 70, 77, 85]
print("search 58 ->", interpolation_search(a, 58))
print("search 40 ->", interpolation_search(a, 40))
