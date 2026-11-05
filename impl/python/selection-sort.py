def selection_sort(a):
    """每一輪從未排序部分選出最小值，放到未排序部分的開頭"""
    n = len(a)
    for i in range(n - 1):
        m = i
        for j in range(i + 1, n):
            if a[j] < a[m]:
                m = j
        a[i], a[m] = a[m], a[i]


a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72]
selection_sort(a)
print(*a)
