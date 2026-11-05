def radix_sort(a):
    """LSD 基數排序：從個位數開始，每一位做一次穩定的計數排序"""
    exp = 1
    while max(a) // exp > 0:
        buckets = [[] for _ in range(10)]
        for x in a:
            buckets[x // exp % 10].append(x)
        a = [x for b in buckets for x in b]
        print(f"digit {exp}:", *a)
        exp *= 10
    return a


a = [170, 45, 75, 90, 802, 24, 2, 66, 431, 318, 59, 7]
print("sorted:", *radix_sort(a))
