from bisect import bisect_right


def subset_sums(xs):
    sums = [0]
    for x in xs:
        sums += [s + x for s in sums]
    return sums


def best_at_most(a, T):
    """兩半各列舉子集合和；右半排序後，對每個左半和二分搜尋 ≤ T − s 的最大值"""
    left, right = subset_sums(a[:len(a) // 2]), sorted(subset_sums(a[len(a) // 2:]))
    best = -1
    for s in left:
        if s > T:
            continue
        i = bisect_right(right, T - s) - 1
        best = max(best, s + right[i])
    return best


a = [7, 3, 12, 18, 5, 9, 14, 2]
for T in (30, 10, 1, 1000):
    brute = max(s for s in subset_sums(a) if s <= T)
    print(f"T = {T}: best = {best_at_most(a, T)} brute = {brute}")
