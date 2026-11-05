def shell_sort(a):
    """間隔 gap 從 n/2 逐次減半，對每個間隔做插入排序；最後 gap = 1 時就是一般的插入排序"""
    gap = len(a) // 2
    while gap > 0:
        for i in range(gap, len(a)):
            key = a[i]
            j = i
            while j >= gap and a[j - gap] > key:
                a[j] = a[j - gap]
                j -= gap
            a[j] = key
        gap //= 2


a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72]
shell_sort(a)
print(*a)
