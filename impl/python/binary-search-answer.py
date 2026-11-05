def min_speed(piles, h):
    """對答案二分：hours(k) = Σ ceil(p / k) 隨 k 遞減，找最小可行的 k；h < 堆數時無解"""
    if h < len(piles):
        return None
    hours = lambda k: sum((p + k - 1) // k for p in piles)
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if hours(mid) <= h:
            hi = mid
        else:
            lo = mid + 1
    return lo


piles = [30, 11, 23, 4, 20]
for h in (6, 5, 10, 100, 4):
    k = min_speed(piles, h)
    print(f"h = {h}: min speed =", "impossible" if k is None else k)
