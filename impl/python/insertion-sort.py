def insertion_sort(a):
    """把每個元素往前插入到已排序部分的正確位置"""
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key


a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72]
insertion_sort(a)
print(*a)
