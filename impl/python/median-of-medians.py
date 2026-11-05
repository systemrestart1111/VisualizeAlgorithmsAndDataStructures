def select(a, k):
    """BFPRT：每 5 個一組取中位數，再遞迴取「中位數的中位數」當 pivot，保證最壞 O(n)"""
    if len(a) <= 5:
        return sorted(a)[k]
    medians = [sorted(a[i:i + 5])[len(a[i:i + 5]) // 2] for i in range(0, len(a), 5)]
    pivot = select(medians, len(medians) // 2)
    lows = [x for x in a if x < pivot]
    highs = [x for x in a if x > pivot]
    equal = len(a) - len(lows) - len(highs)
    if k < len(lows):
        return select(lows, k)
    if k < len(lows) + equal:
        return pivot
    return select(highs, k - len(lows) - equal)


a = [12, 3, 5, 7, 4, 19, 26, 1, 14, 8, 22, 17, 9, 30, 2, 11, 25, 6, 15, 20, 28, 10, 13]
print("k = 11 ->", select(a, 11))
