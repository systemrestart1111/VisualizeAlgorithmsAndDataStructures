def reverse(a, i, j):
    while i < j:
        a[i], a[j] = a[j], a[i]
        i += 1
        j -= 1


def rotate_right(a, k):
    """三次反轉：整段反轉，再分別反轉前 k 個與其餘部分"""
    n = len(a)
    k %= n
    reverse(a, 0, n - 1)
    reverse(a, 0, k - 1)
    reverse(a, k, n - 1)


a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
rotate_right(a, 3)
print(*a)
