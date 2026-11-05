EDGES = [(1, 2), (1, 3), (2, 4), (2, 5), (3, 6), (3, 7), (5, 8), (5, 9), (7, 10)]
n = 10
adj = {v: [] for v in range(1, n + 1)}
for a, b in EDGES:
    adj[a].append(b)
    adj[b].append(a)

# 以 1 為根的 BFS 順序與父節點
order, par = [1], {1: 0}
for u in order:
    for v in adj[u]:
        if v not in par:
            par[v] = u
            order.append(v)
sz, down, ans = {}, {}, {}
for u in reversed(order):  # 第一次：由下往上
    kids = [v for v in adj[u] if par.get(v) == u]
    sz[u] = 1 + sum(sz[v] for v in kids)
    down[u] = sum(down[v] + sz[v] for v in kids)
ans[1] = down[1]
for u in order:  # 第二次：換根，由上往下
    for v in adj[u]:
        if par.get(v) == u:
            ans[v] = ans[u] - sz[v] + (n - sz[v])
print("sum of distances:", " ".join(f"{v}:{ans[v]}" for v in range(1, n + 1)))
best = min(ans, key=lambda v: (ans[v], v))
print("best center:", best, "with", ans[best])
