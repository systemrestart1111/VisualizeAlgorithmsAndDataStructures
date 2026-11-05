def build_prefix(a):
    """p[i] = a[0] + … + a[i-1]；區間和 a[l..r] = p[r+1] - p[l]，查詢 O(1)"""
    p = [0] * (len(a) + 1)
    for i, x in enumerate(a):
        p[i + 1] = p[i] + x
    return p


a = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
p = build_prefix(a)
print("prefix:", *p)
print("sum[2..6] =", p[7] - p[2])
