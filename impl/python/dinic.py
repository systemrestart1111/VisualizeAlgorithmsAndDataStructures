from collections import deque

NAMES = "SACBDT"
EDGES = [("S", "A", 10), ("S", "C", 10), ("A", "B", 4), ("A", "C", 2), ("A", "D", 8),
         ("C", "D", 9), ("D", "B", 6), ("B", "T", 10), ("D", "T", 10)]
n = len(NAMES)
cap = [[0] * n for _ in range(n)]
for a, b, c in EDGES:
    cap[NAMES.index(a)][NAMES.index(b)] += c
S, T = NAMES.index("S"), NAMES.index("T")


def bfs_level():
    """建立層次圖：level[v] = S 到 v 的最少邊數"""
    level = [-1] * n
    level[S] = 0
    q = deque([S])
    while q:
        u = q.popleft()
        for v in range(n):
            if level[v] < 0 and cap[u][v] > 0:
                level[v] = level[u] + 1
                q.append(v)
    return level if level[T] >= 0 else None


def dfs(u, pushed, level, it):
    """只沿 level 加一的邊前進（阻塞流）；it[u] 記錄 u 下一條要試的邊，走不通的邊不再重試"""
    if u == T:
        return pushed
    while it[u] < n:
        v = it[u]
        if cap[u][v] > 0 and level[v] == level[u] + 1:
            d = dfs(v, min(pushed, cap[u][v]), level, it)
            if d:
                cap[u][v] -= d
                cap[v][u] += d
                return d
        it[u] += 1
    return 0


flow, phase = 0, 0
while (level := bfs_level()) is not None:
    phase += 1
    it, got = [0] * n, 0
    while (d := dfs(S, float("inf"), level, it)):
        got += d
    flow += got
    print(f"phase {phase}: levels", " ".join(f"{NAMES[v]}={level[v]}" for v in range(n) if level[v] >= 0), f"blocking flow +{got}")
print("max flow =", flow)
reach, stack = {S}, [S]
while stack:
    u = stack.pop()
    for v in range(n):
        if cap[u][v] > 0 and v not in reach:
            reach.add(v)
            stack.append(v)
print("min cut S-side:", *(NAMES[v] for v in sorted(reach)))
