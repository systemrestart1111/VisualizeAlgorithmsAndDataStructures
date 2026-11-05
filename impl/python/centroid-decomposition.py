EDGES = [(1, 2), (2, 3), (3, 4), (4, 5), (5, 6), (6, 7), (4, 8), (8, 9), (9, 10), (2, 11), (6, 12)]
nodes = []
adj = {}
for a, b in EDGES:
    for x in (a, b):
        if x not in adj:
            adj[x] = []
            nodes.append(x)
    adj[a].append(b)
    adj[b].append(a)
for v in adj:
    adj[v].sort(key=str)  # 與網頁相同：鄰居依字串排序
removed, cpar, level = set(), {}, {}


def component(s):
    order, seen = [s], {s}
    for u in order:
        for v in adj[u]:
            if v not in removed and v not in seen:
                seen.add(v)
                order.append(v)
    return order


def decompose(start, par, lv):
    """找出塊的重心（刪除後最大塊 ≤ 一半），移除後對每一塊遞迴"""
    order = component(start)
    pr = {start: None}
    for u in order:
        for v in adj[u]:
            if v not in removed and v not in pr:
                pr[v] = u
    sz = {}
    for u in reversed(order):
        sz[u] = 1 + sum(sz[v] for v in adj[u] if v not in removed and pr.get(v) == u)
    n = len(order)
    c = start
    for u in order:
        biggest = max([n - sz[u]] + [sz[v] for v in adj[u] if v not in removed and pr.get(v) == u])
        if biggest <= n / 2:
            c = u
            break
    removed.add(c)
    cpar[c], level[c] = par, lv
    for v in adj[c]:
        if v not in removed:
            decompose(v, c, lv + 1)


decompose(nodes[0], None, 0)
for v in sorted(nodes):
    print(f"node {v:2d}: level {level[v]}, centroid parent {cpar[v] if cpar[v] is not None else '-'}")
print("depth:", max(level.values()) + 1)
