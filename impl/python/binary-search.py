def binary_search(a, t):
    """a 已排序；每次與中間元素比較，捨棄一半的搜尋範圍"""
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == t:
            return mid
        if a[mid] < t:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1


a = [3, 8, 12, 17, 23, 31, 38, 45, 52, 60, 67, 74, 81, 89, 95]
print("search 67 ->", binary_search(a, 67))
print("search 50 ->", binary_search(a, 50))
