def max_window_sum(a, k):
    """固定長度 k：加入右邊新元素、減去左邊離開的元素"""
    s = sum(a[:k])
    best, at = s, 0
    for i in range(k, len(a)):
        s += a[i] - a[i - k]
        if s > best:
            best, at = s, i - k + 1
    return best, at


def min_len_at_least(a, S):
    """可變視窗：只適用於元素皆為正；回傳最短長度，不存在回傳 0"""
    if any(x <= 0 for x in a):
        return None
    l = s = 0
    best = float("inf")
    for r, x in enumerate(a):
        s += x
        while s >= S:
            best = min(best, r - l + 1)
            s -= a[l]
            l += 1
    return 0 if best == float("inf") else best


a = [4, 2, 12, 1, 7, 9, 3, 2, 8, 5]
print("max sum of length 3: %d at %d" % max_window_sum(a, 3))
print("shortest with sum >= 18:", min_len_at_least(a, 18))
print("shortest with sum >= 100:", min_len_at_least(a, 100))
r = min_len_at_least([3, -1, 4], 5)
print("with negatives:", "not applicable" if r is None else r)
