def second_largest(a, distinct=True):
    """一次掃描維護 first 與 second；distinct=True 求第二大相異值，可能不存在（None）"""
    first = second = None
    for x in a:
        if first is None or x > first:
            second, first = first, x
        elif x == first:
            if not distinct:
                second = x
        elif second is None or x > second:
            second = x
    return second


for a in ([12, 35, 1, 10, 34, 35, 1], [5, 5, 3], [7, 7, 7], [4]):
    d, r = second_largest(a), second_largest(a, distinct=False)
    print(a, "distinct:", "none" if d is None else d, "rank:", "none" if r is None else r)
