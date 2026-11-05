def binary_search(a, t, lo, hi):
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == t:
            return mid
        if a[mid] < t:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1


def exponential_search(a, t):
    """範圍以 1, 2, 4, 8… 倍增，找到包含 t 的區間後做二分搜尋"""
    if not a:
        return -1
    if a[0] == t:
        return 0
    i = 1
    while i < len(a) and a[i] <= t:
        i *= 2
    return binary_search(a, t, i // 2, min(i, len(a) - 1))


a = [2, 5, 8, 11, 15, 19, 24, 28, 33, 39, 44, 50, 57, 63, 70, 78, 85, 93]
print("search 57 ->", exponential_search(a, 57))
print("search 60 ->", exponential_search(a, 60))
