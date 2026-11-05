EDGES = "AB BC CA CD DE EF FD FG GH BI".split()
nodes = sorted({v for e in EDGES for v in e})
adj = {v: [] for v in nodes}
for a, b in EDGES:
    adj[a].append(b)
    adj[b].append(a)

tin, low = {}, {}
bridges, cut = [], set()


def dfs(u, parent):
    """low[v] > tin[u]：v 的子樹回不到 u 以上，(u, v) 是橋；low[v] >= tin[u]：u 是割點（根需有兩個以上子樹）"""
    tin[u] = low[u] = len(tin)
    children = 0
    for v in adj[u]:
        if v == parent:
            continue
        if v in tin:
            low[u] = min(low[u], tin[v])
        else:
            dfs(v, u)
            low[u] = min(low[u], low[v])
            children += 1
            if low[v] > tin[u]:
                bridges.append("".join(sorted(u + v)))
            if parent is not None and low[v] >= tin[u]:
                cut.add(u)
    if parent is None and children > 1:
        cut.add(u)


dfs(nodes[0], None)
print("bridges:", *(f"{e[0]}-{e[1]}" for e in sorted(bridges)))
print("articulation points:", *sorted(cut))
