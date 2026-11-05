def insertion_sort(a, lo, hi):
    for i in range(lo + 1, hi):
        key, j = a[i], i - 1
        while j >= lo and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key


def merge(a, lo, mid, hi):
    left, right = a[lo:mid], a[mid:hi]
    i = j = 0
    for k in range(lo, hi):
        if j >= len(right) or (i < len(left) and left[i] <= right[j]):
            a[k] = left[i]; i += 1
        else:
            a[k] = right[j]; j += 1


def tim_sort(a, minrun=4):
    """簡化版 TimSort：先把每段 minrun 個元素用插入排序排好，再兩兩合併、長度倍增"""
    n = len(a)
    for lo in range(0, n, minrun):
        insertion_sort(a, lo, min(lo + minrun, n))
    size = minrun
    while size < n:
        for lo in range(0, n, 2 * size):
            mid, hi = min(lo + size, n), min(lo + 2 * size, n)
            if mid < hi:
                merge(a, lo, mid, hi)
        size *= 2


a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47, 90, 14, 66, 23]
tim_sort(a, 4)
print(*a)
