from collections import deque

NAMES = "SABCT"
EDGES = [("S", "A", 4, 1), ("S", "B", 2, 2), ("A", "B", 2, 1), ("A", "C", 2, 3),
         ("B", "C", 5, 1), ("A", "T", 1, 6), ("C", "T", 4, 2), ("B", "T", 1, 5)]  # (起點, 終點, 容量, 單位費用)
n = len(NAMES)
cap = [[0] * n for _ in range(n)]
cost = [[0] * n for _ in range(n)]
for a, b, c, w in EDGES:
    u, v = NAMES.index(a), NAMES.index(b)
    cap[u][v], cost[u][v], cost[v][u] = c, w, -w  # 反向邊費用為負，退流時可以把費用扣回來
S, T = NAMES.index("S"), NAMES.index("T")


def spfa():
    """在殘餘網路上找費用最小的 S→T 路徑（有負費用的反向邊，所以用 SPFA / Bellman-Ford）"""
    dist, parent, inq = [float("inf")] * n, [-1] * n, [False] * n
    dist[S] = 0
    q = deque([S])
    while q:
        u = q.popleft()
        inq[u] = False
        for v in range(n):
            if cap[u][v] > 0 and dist[u] + cost[u][v] < dist[v]:
                dist[v], parent[v] = dist[u] + cost[u][v], u
                if not inq[v]:
                    inq[v] = True
                    q.append(v)
    return dist, parent


flow = total = 0
while True:
    dist, parent = spfa()
    if dist[T] == float("inf"):
        break
    path, v = [T], T
    while v != S:
        v = parent[v]
        path.append(v)
    path.reverse()
    b = min(cap[u][v] for u, v in zip(path, path[1:]))
    for u, v in zip(path, path[1:]):
        cap[u][v] -= b
        cap[v][u] += b
    flow += b
    total += b * dist[T]
    print(" -> ".join(NAMES[x] for x in path), f"flow {b} x cost {dist[T]}")
print("max flow =", flow, "min cost =", total)
