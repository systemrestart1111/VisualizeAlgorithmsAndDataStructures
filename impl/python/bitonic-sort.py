def bitonic_sort(a):
    """雙調排序（n 為 2 的冪）：比較網路，每一層的比較互不相依，適合平行硬體"""
    n = len(a)
    k = 2
    while k <= n:
        j = k // 2
        while j > 0:
            for i in range(n):
                p = i ^ j
                if p > i:
                    up = (i & k) == 0
                    if (a[i] > a[p]) == up:
                        a[i], a[p] = a[p], a[i]
            j //= 2
        k *= 2


a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47, 90, 14]
bitonic_sort(a)
print(*a)
