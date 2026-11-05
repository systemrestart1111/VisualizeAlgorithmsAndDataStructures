def search(a, t):
    """至少有一半是有序的；a[lo] = a[mid] = a[hi] 時無法判斷，兩端各縮一格"""
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == t:
            return mid
        if a[lo] == a[mid] == a[hi]:
            lo, hi = lo + 1, hi - 1
        elif a[lo] <= a[mid]:
            if a[lo] <= t < a[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if a[mid] < t <= a[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1


a = [45, 52, 60, 67, 74, 3, 8, 12, 17, 23, 31, 38]
for t in (12, 45, 38, 50):
    print(f"find {t}:", search(a, t))
print("duplicates find 3:", search([2, 2, 2, 3, 2, 2, 2], 3))
