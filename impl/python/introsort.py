import math


def insertion_sort(a, lo, hi):
    for i in range(lo + 1, hi + 1):
        key, j = a[i], i - 1
        while j >= lo and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key


def heap_sort_range(a, lo, hi):
    n = hi - lo + 1

    def sift(i, size):
        while True:
            big, l, r = i, 2 * i + 1, 2 * i + 2
            if l < size and a[lo + l] > a[lo + big]:
                big = l
            if r < size and a[lo + r] > a[lo + big]:
                big = r
            if big == i:
                return
            a[lo + i], a[lo + big] = a[lo + big], a[lo + i]
            i = big

    for i in range(n // 2 - 1, -1, -1):
        sift(i, n)
    for end in range(n - 1, 0, -1):
        a[lo], a[lo + end] = a[lo + end], a[lo]
        sift(0, end)


def partition(a, lo, hi):
    pivot, i = a[hi], lo
    for j in range(lo, hi):
        if a[j] < pivot:
            a[i], a[j] = a[j], a[i]
            i += 1
    a[i], a[hi] = a[hi], a[i]
    return i


def intro(a, lo, hi, depth, small):
    """快速排序為主；區間很小改用插入排序，遞迴太深改用堆積排序，保證 O(n log n)"""
    if hi - lo + 1 <= small:
        insertion_sort(a, lo, hi)
    elif depth == 0:
        heap_sort_range(a, lo, hi)
    else:
        p = partition(a, lo, hi)
        intro(a, lo, p - 1, depth - 1, small)
        intro(a, p + 1, hi, depth - 1, small)


a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47, 90, 14, 66, 23, 50, 8]
intro(a, 0, len(a) - 1, 2 * int(math.log2(len(a))), 4)
print(*a)
