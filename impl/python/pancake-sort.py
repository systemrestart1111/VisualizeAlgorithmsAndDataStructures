def flip(a, k):
    a[:k + 1] = a[k::-1]


def pancake_sort(a):
    """只用前綴翻轉：最大值先翻到最前面，再翻到未排序部分的底部"""
    flips = []
    for size in range(len(a), 1, -1):
        m = max(range(size), key=lambda i: a[i])
        if m == size - 1:
            continue
        if m != 0:
            flip(a, m)
            flips.append(m)
        flip(a, size - 1)
        flips.append(size - 1)
    return flips


a = [3, 6, 1, 8, 4, 9, 2, 7, 5]
f = pancake_sort(a)
print("sorted:", *a)
print("flips:", len(f), "prefix lengths:", *[k + 1 for k in f])
