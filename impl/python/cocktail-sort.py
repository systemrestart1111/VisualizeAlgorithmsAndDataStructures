def cocktail_sort(a):
    """雙向氣泡排序：先由左往右把最大值推到右端，再由右往左把最小值推到左端"""
    lo, hi = 0, len(a) - 1
    swapped = True
    while swapped and lo < hi:
        swapped = False
        for i in range(lo, hi):
            if a[i] > a[i + 1]:
                a[i], a[i + 1] = a[i + 1], a[i]
                swapped = True
        hi -= 1
        for i in range(hi, lo, -1):
            if a[i - 1] > a[i]:
                a[i - 1], a[i] = a[i], a[i - 1]
                swapped = True
        lo += 1


a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72]
cocktail_sort(a)
print(*a)
