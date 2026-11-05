def apply_updates(a, ops):
    """差分陣列：區間 [l, r] 加 v 只需 d[l] += v、d[r+1] -= v，最後做一次前綴和還原"""
    d = [0] * (len(a) + 1)
    for l, r, v in ops:
        d[l] += v
        d[r + 1] -= v
    run = 0
    for i in range(len(a)):
        run += d[i]
        a[i] += run
    return a


a = [5] * 10
ops = [(1, 4, 3), (3, 7, 2), (0, 2, -1), (6, 9, 5)]
print(*apply_updates(a, ops))
