def median(a, b):
    """在較短陣列上二分切點，使左半共 (m+n+1)//2 個且左半最大 ≤ 右半最小"""
    if len(a) > len(b):
        a, b = b, a
    m, n = len(a), len(b)
    half = (m + n + 1) // 2
    lo, hi = 0, m
    inf = float("inf")
    while lo <= hi:
        i = (lo + hi) // 2
        j = half - i
        l1 = a[i - 1] if i > 0 else -inf
        r1 = a[i] if i < m else inf
        l2 = b[j - 1] if j > 0 else -inf
        r2 = b[j] if j < n else inf
        if l1 <= r2 and l2 <= r1:
            return max(l1, l2) if (m + n) % 2 else (max(l1, l2) + min(r1, r2)) / 2
        if l1 > r2:
            hi = i - 1
        else:
            lo = i + 1


for a, b in (([1, 3, 8, 9, 15], [7, 11, 18, 19, 21, 25]), ([], [2, 3]), ([1, 2], [3, 4]), ([5], [1, 2, 3, 4])):
    print(a, b, "median = %.1f" % median(a, b))
