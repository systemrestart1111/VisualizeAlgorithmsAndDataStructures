EDGES = [(1, 2), (1, 3), (2, 4), (2, 5), (3, 6), (3, 7), (5, 8), (5, 9), (6, 10), (9, 11), (7, 12)]
N, LOG = 13, 4
adj = [[] for _ in range(N)]
for a, b in EDGES:
    adj[a].append(b)
    adj[b].append(a)

# up[k][v] = v 往上第 2^k 個祖先（倍增法）
up = [[0] * N for _ in range(LOG)]
depth = [0] * N
stack, seen = [1], {1}
while stack:
    u = stack.pop()
    for v in adj[u]:
        if v not in seen:
            seen.add(v)
            up[0][v], depth[v] = u, depth[u] + 1
            stack.append(v)
up[0][1] = 1
for k in range(1, LOG):
    for v in range(1, N):
        up[k][v] = up[k - 1][up[k - 1][v]]


def lca(a, b):
    """先把較深的點往上跳到同一深度，再兩點同時從大步到小步往上跳"""
    if depth[a] < depth[b]:
        a, b = b, a
    diff = depth[a] - depth[b]
    for k in range(LOG):
        if diff >> k & 1:
            a = up[k][a]
    if a == b:
        return a
    for k in range(LOG - 1, -1, -1):
        if up[k][a] != up[k][b]:
            a, b = up[k][a], up[k][b]
    return up[0][a]


for a, b in [(8, 11), (10, 12), (4, 11)]:
    print(f"LCA({a}, {b}) = {lca(a, b)}")
