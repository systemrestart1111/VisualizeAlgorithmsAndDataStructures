def bubble_sort(a):
    """相鄰兩兩比較，大的往後換；某一輪沒有交換就提早結束"""
    n = len(a)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:
            break


a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72]
bubble_sort(a)
print(*a)
