RECTS = [(1, 1, 6, 5), (3, 3, 9, 8), (7, 1, 11, 4), (2, 6, 5, 10)]  # (x1, y1, x2, y2)

# 掃描線：把所有矩形的左右邊 x 當成事件排序；相鄰兩個事件之間的直條內，覆蓋的 y 長度固定
xs = sorted({x for r in RECTS for x in (r[0], r[2])})
total = 0
for xa, xb in zip(xs, xs[1:]):
    ivs = sorted((r[1], r[3]) for r in RECTS if r[0] <= xa and r[2] >= xb)  # 這一條內有效的 y 區間
    covered, cur_lo, cur_hi = 0, None, None
    for lo, hi in ivs:  # 合併重疊的 y 區間
        if cur_hi is None or lo > cur_hi:
            if cur_hi is not None:
                covered += cur_hi - cur_lo
            cur_lo, cur_hi = lo, hi
        else:
            cur_hi = max(cur_hi, hi)
    if cur_hi is not None:
        covered += cur_hi - cur_lo
    total += covered * (xb - xa)
    print(f"x in [{xa}, {xb}): covered y = {covered}, area += {covered * (xb - xa)}")
print("union area =", total)
