from collections import deque

EDGES = [(1, 2), (1, 3), (2, 4), (2, 5), (3, 6), (3, 7), (5, 8), (5, 9), (6, 10), (9, 11), (7, 12)]
adj = {}
for a, b in EDGES:
    adj.setdefault(a, []).append(b)
    adj.setdefault(b, []).append(a)


def bfs(src):
    """回傳距離最遠的點與 parent 表（距離相同時取最先被發現的點）"""
    dist, parent = {src: 0}, {src: None}
    q, far = deque([src]), src
    while q:
        u = q.popleft()
        if dist[u] > dist[far]:
            far = u
        for v in adj[u]:
            if v not in dist:
                dist[v], parent[v] = dist[u] + 1, u
                q.append(v)
    return far, dist[far], parent


u, _, _ = bfs(1)        # 第一次 BFS：任意點出發的最遠點 u 一定是直徑的端點
v, d, parent = bfs(u)   # 第二次 BFS：從 u 出發的最遠點 v
path = []
while v is not None:
    path.append(v)
    v = parent[v]
print("diameter =", d)
print("path:", *path)
