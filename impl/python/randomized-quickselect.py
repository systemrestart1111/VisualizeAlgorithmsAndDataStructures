state = 42


def rand_int(k):
    """Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1"""
    global state
    state = state * 48271 % 2147483647
    return state % k


def quickselect(a, k):
    """隨機選 pivot，讓已排序等「最壞輸入」也只有極低機率退化成 O(n²)；期望時間 O(n)"""
    lo, hi = 0, len(a) - 1
    while True:
        r = lo + rand_int(hi - lo + 1)
        a[r], a[hi] = a[hi], a[r]
        pivot, i = a[hi], lo
        for j in range(lo, hi):
            if a[j] < pivot:
                a[i], a[j] = a[j], a[i]
                i += 1
        a[i], a[hi] = a[hi], a[i]
        print(f"range [{lo}, {hi}] pivot {pivot} -> position {i}")
        if i == k:
            return a[i]
        if k < i:
            hi = i - 1
        else:
            lo = i + 1


a = list(range(1, 15))
print("k = 3 ->", quickselect(a, 3))
