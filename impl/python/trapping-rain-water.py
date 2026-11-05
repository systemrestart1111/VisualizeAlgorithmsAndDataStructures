def trap(h):
    """雙指標：較矮那一側的最高牆決定該側水位"""
    l, r = 0, len(h) - 1
    lm = rm = water = 0
    while l < r:
        if h[l] < h[r]:
            lm = max(lm, h[l])
            water += lm - h[l]
            l += 1
        else:
            rm = max(rm, h[r])
            water += rm - h[r]
            r -= 1
    return water


def baseline(h):
    return sum(max(0, min(max(h[:i + 1]), max(h[i:])) - h[i]) for i in range(len(h)))


for h in ([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], [4, 2, 0, 3, 2, 5], [1, 2, 3], [5]):
    print(h, "water:", trap(h), "baseline:", baseline(h))
