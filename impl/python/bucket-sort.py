def bucket_sort(a, k):
    """依數值範圍把元素分進 k 個桶，各桶內排序後依序串接"""
    lo, hi = min(a), max(a)
    buckets = [[] for _ in range(k)]
    for x in a:
        buckets[(x - lo) * k // (hi - lo + 1)].append(x)
    for i, b in enumerate(buckets):
        b.sort()
        print(f"bucket {i}:", *b)
    return [x for b in buckets for x in b]


a = [29, 25, 3, 49, 9, 37, 21, 43, 12, 33, 6, 41, 17, 48]
print("sorted:", *bucket_sort(a, 5))
