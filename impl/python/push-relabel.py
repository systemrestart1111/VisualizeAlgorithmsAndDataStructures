from collections import deque

NAMES = "SACBDT"
EDGES = [("S", "A", 10), ("S", "C", 10), ("A", "B", 4), ("A", "C", 2), ("A", "D", 8),
         ("C", "D", 9), ("D", "B", 6), ("B", "T", 10), ("D", "T", 10)]
n = len(NAMES)
cap = [[0] * n for _ in range(n)]
for a, b, c in EDGES:
    cap[NAMES.index(a)][NAMES.index(b)] += c
S, T = NAMES.index("S"), NAMES.index("T")

# 前置流：先把 S 的出邊全部灌滿；之後不斷把「溢出」的點的多餘流量往較低的鄰居推，推不動就把自己抬高
height, excess = [0] * n, [0] * n
height[S] = n
active = deque()
for v in range(n):
    if cap[S][v] > 0:
        excess[v] += cap[S][v]
        cap[v][S] += cap[S][v]
        cap[S][v] = 0
        if v != T:
            active.append(v)
pushes = relabels = 0
while active:  # FIFO：依序處理溢出的點
    u = active.popleft()
    while excess[u] > 0:
        for v in range(n):
            if excess[u] == 0:
                break
            if cap[u][v] > 0 and height[u] == height[v] + 1:  # 只能往低一層推
                d = min(excess[u], cap[u][v])
                cap[u][v] -= d
                cap[v][u] += d
                excess[u] -= d
                excess[v] += d
                pushes += 1
                if v not in (S, T) and excess[v] == d:
                    active.append(v)
        if excess[u] > 0:  # 推不出去：抬高到比最低的可達鄰居高一層
            height[u] = 1 + min(height[v] for v in range(n) if cap[u][v] > 0)
            relabels += 1
print("max flow =", excess[T])
print("pushes =", pushes, "relabels =", relabels)
reach, stack = {S}, [S]
while stack:
    u = stack.pop()
    for v in range(n):
        if cap[u][v] > 0 and v not in reach:
            reach.add(v)
            stack.append(v)
print("min cut S-side:", *(NAMES[v] for v in sorted(reach)))
