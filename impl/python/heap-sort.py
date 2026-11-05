def sift_down(a, i, n):
    """把 a[i] 往下沉，直到它比兩個子節點都大（最大堆積）"""
    while True:
        big, l, r = i, 2 * i + 1, 2 * i + 2
        if l < n and a[l] > a[big]:
            big = l
        if r < n and a[r] > a[big]:
            big = r
        if big == i:
            return
        a[i], a[big] = a[big], a[i]
        i = big


def heap_sort(a):
    n = len(a)
    for i in range(n // 2 - 1, -1, -1):  # 由下往上建堆
        sift_down(a, i, n)
    for end in range(n - 1, 0, -1):  # 每次把最大值換到尾端
        a[0], a[end] = a[end], a[0]
        sift_down(a, 0, end)


a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72]
heap_sort(a)
print(*a)
