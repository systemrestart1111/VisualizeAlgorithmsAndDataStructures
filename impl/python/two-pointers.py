def two_sum_sorted(a, t):
    """已排序陣列：和太小移左指標、太大移右指標"""
    l, r = 0, len(a) - 1
    while l < r:
        s = a[l] + a[r]
        if s == t:
            return l, r
        if s < t:
            l += 1
        else:
            r -= 1
    return None


a = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
for t in (61, 100, 4, 163):
    res = two_sum_sorted(a, t)
    brute = any(a[i] + a[j] == t for i in range(len(a)) for j in range(i + 1, len(a)))
    print(f"t = {t}:", f"a[{res[0]}] + a[{res[1]}] = {a[res[0]]} + {a[res[1]]}" if res else "none", "| brute:", brute)
