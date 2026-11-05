from collections import deque

NAMES = "SACBDT"
EDGES = [("S", "A", 10), ("S", "C", 10), ("A", "B", 4), ("A", "C", 2), ("A", "D", 8),
         ("C", "D", 9), ("D", "B", 6), ("B", "T", 10), ("D", "T", 10)]
n = len(NAMES)
cap = [[0] * n for _ in range(n)]
for a, b, c in EDGES:
    cap[NAMES.index(a)][NAMES.index(b)] += c
S, T = NAMES.index("S"), NAMES.index("T")


def bfs():
    """用 BFS 找「邊數最少」的增廣路徑，保證總共只需 O(VE) 次增廣"""
    parent = [-1] * n
    parent[S] = S
    q = deque([S])
    while q:
        u = q.popleft()
        for v in range(n):
            if parent[v] < 0 and cap[u][v] > 0:
                parent[v] = u
                q.append(v)
    return parent if parent[T] >= 0 else None


flow = 0
while (parent := bfs()) is not None:
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
    print(" -> ".join(NAMES[x] for x in path), f"(+{b})")
print("max flow =", flow)
reach, stack = {S}, [S]
while stack:
    u = stack.pop()
    for v in range(n):
        if cap[u][v] > 0 and v not in reach:
            reach.add(v)
            stack.append(v)
print("min cut S-side:", *(NAMES[v] for v in sorted(reach)))
