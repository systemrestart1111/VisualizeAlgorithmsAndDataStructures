def inplace_merge(a, mid):
    """a[:mid] 與 a[mid:] 各自有序；不用額外陣列，把右段元素依序往左插入（O(n·m)）"""
    i, j = 0, mid
    while i < j < len(a):
        if a[i] <= a[j]:
            i += 1
        else:
            v = a[j]
            for k in range(j, i, -1):  # a[i..j-1] 整段右移一格
                a[k] = a[k - 1]
            a[i] = v
            i += 1
            j += 1


a = [3, 8, 15, 22, 40, 1, 9, 10, 25, 30, 45]
inplace_merge(a, 5)
print(*a)
