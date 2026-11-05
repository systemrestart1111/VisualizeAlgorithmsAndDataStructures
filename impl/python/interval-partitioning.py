import heapq

IV = [(0, 3), (1, 4), (2, 6), (4, 7), (5, 9), (6, 8), (7, 10), (9, 12), (8, 11), (11, 13)]

# 依開始時間處理；最小堆積存 (結束時間, 教室編號)，最早空出的教室若來得及就沿用，否則開新教室
heap, rooms = [], 0
for s, e in sorted(IV):
    if heap and heap[0][0] <= s:
        _, r = heapq.heappop(heap)
    else:
        r = rooms
        rooms += 1
    heapq.heappush(heap, (e, r))
    print(f"[{s},{e}) -> room {r}")
print("rooms needed =", rooms)
