IV = [(1, 4), (3, 5), (0, 6), (5, 7), (3, 9), (5, 9), (6, 10), (8, 11), (8, 12), (2, 14), (12, 16)]

# 依結束時間排序，每次選最早結束、且不與已選區間重疊的活動
chosen, end = [], float("-inf")
for s, e in sorted(IV, key=lambda x: x[1]):
    if s >= end:
        chosen.append((s, e))
        end = e
print("selected:", " ".join(f"[{s},{e})" for s, e in chosen))
print("count =", len(chosen))
