NAMES = "SACBDT"
EDGES = [("S", "A", 10), ("S", "C", 10), ("A", "B", 4), ("A", "C", 2), ("A", "D", 8),
         ("C", "D", 9), ("D", "B", 6), ("B", "T", 10), ("D", "T", 10)]
n = len(NAMES)
cap = [[0] * n for _ in range(n)]  # 殘餘容量
for a, b, c in EDGES:
    cap[NAMES.index(a)][NAMES.index(b)] += c
S, T = NAMES.index("S"), NAMES.index("T")


def dfs(u, seen, path):
    """在殘餘網路上用 DFS 找一條 S→T 的增廣路徑"""
    if u == T:
        return True
    seen[u] = True
    for v in range(n):
        if not seen[v] and cap[u][v] > 0:
            path.append(v)
            if dfs(v, seen, path):
                return True
            path.pop()
    return False


flow = 0
while True:
    path = [S]
    if not dfs(S, [False] * n, path):
        break
    b = min(cap[u][v] for u, v in zip(path, path[1:]))  # 瓶頸
    for u, v in zip(path, path[1:]):
        cap[u][v] -= b
        cap[v][u] += b  # 反向邊讓之後可以「退回」流量
    flow += b
    print(" -> ".join(NAMES[x] for x in path), f"(+{b})")
print("max flow =", flow)

# 最後在殘餘網路上從 S 能到達的點就是最小割的 S 側
reach, stack = {S}, [S]
while stack:
    u = stack.pop()
    for v in range(n):
        if cap[u][v] > 0 and v not in reach:
            reach.add(v)
            stack.append(v)
print("min cut S-side:", *(NAMES[v] for v in sorted(reach)))
