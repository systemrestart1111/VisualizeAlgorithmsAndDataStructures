from bisect import bisect_left


def compress(a):
    """把每個值換成它在「排序後去重複」陣列中的排名"""
    vals = sorted(set(a))
    return [bisect_left(vals, x) for x in a], vals


a = [1000000, 30, -5, 30, 99999, 7, -5, 2000]
ranks, vals = compress(a)
print("values:", *vals)
print("ranks :", *ranks)
ok = all((a[i] < a[j]) == (ranks[i] < ranks[j]) and (a[i] == a[j]) == (ranks[i] == ranks[j]) for i in range(len(a)) for j in range(len(a)))
print("order preserved:", ok)
