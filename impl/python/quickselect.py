def partition(a, lo, hi):
    pivot, i = a[hi], lo
    for j in range(lo, hi):
        if a[j] < pivot:
            a[i], a[j] = a[j], a[i]
            i += 1
    a[i], a[hi] = a[hi], a[i]
    return i


def quickselect(a, k):
    """找第 k 小（0 起算）：分割後只往含有第 k 個位置的那一邊繼續，平均 O(n)"""
    lo, hi = 0, len(a) - 1
    while True:
        p = partition(a, lo, hi)
        if p == k:
            return a[p]
        if k < p:
            hi = p - 1
        else:
            lo = p + 1


a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72]
print("k = 5 ->", quickselect(a, 5))
