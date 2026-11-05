ITEMS = [(10, 60), (20, 100), (30, 120), (5, 50), (15, 45)]  # (重量, 價值)
CAP = 50

# 依「單位重量價值」由高到低裝；最後一件裝不下就只裝一部分
order = sorted(range(len(ITEMS)), key=lambda i: ITEMS[i][1] / ITEMS[i][0], reverse=True)
left, total = CAP, 0.0
for i in order:
    w, v = ITEMS[i]
    if left == 0:
        break
    take = min(w, left)
    total += v * take / w
    left -= take
    print(f"item {i} (w={w}, v={v}, ratio={v / w:.2f}): take {take}/{w}")
print(f"total value = {total:.2f}")
