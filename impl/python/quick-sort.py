def partition(a, lo, hi):
    """Lomuto 分割：以最後一個元素為 pivot，比它小的都移到左邊"""
    pivot = a[hi]
    i = lo
    for j in range(lo, hi):
        if a[j] < pivot:
            a[i], a[j] = a[j], a[i]
            i += 1
    a[i], a[hi] = a[hi], a[i]
    return i


def quick_sort(a, lo, hi):
    if lo < hi:
        p = partition(a, lo, hi)
        quick_sort(a, lo, p - 1)
        quick_sort(a, p + 1, hi)


a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47]
quick_sort(a, 0, len(a) - 1)
print(*a)
