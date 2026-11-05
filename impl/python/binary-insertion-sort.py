def binary_insertion_sort(a, key=lambda x: x):
    """二分找第一個 > key 的位置（upper bound），相等鍵保持原順序。回傳 (比較, 搬移)"""
    comps = moves = 0
    for i in range(1, len(a)):
        x = a[i]
        lo, hi = 0, i
        while lo < hi:
            mid = (lo + hi) // 2
            comps += 1
            if key(a[mid]) <= key(x):
                lo = mid + 1
            else:
                hi = mid
        for j in range(i, lo, -1):
            a[j] = a[j - 1]
            moves += 1
        a[lo] = x
    return comps, moves


a = [5, 2, 8, 2, 9, 1, 5, 6, 3, 5]
c, m = binary_insertion_sort(a)
print("sorted:", *a)
print("comparisons:", c, "moves:", m)
pairs = [(3, "a"), (1, "b"), (3, "c"), (2, "d"), (1, "e")]
binary_insertion_sort(pairs, key=lambda p: p[0])
print("stable:", " ".join(f"{k}{v}" for k, v in pairs))
