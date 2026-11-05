def comb_sort(a):
    """比較間隔 gap 的元素，gap 每輪除以 1.3；gap 縮到 1 且沒有交換時結束"""
    gap = len(a)
    done = False
    while not done:
        gap = max(1, int(gap / 1.3))
        done = gap == 1
        for i in range(len(a) - gap):
            if a[i] > a[i + gap]:
                a[i], a[i + gap] = a[i + gap], a[i]
                done = False


a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72]
comb_sort(a)
print(*a)
