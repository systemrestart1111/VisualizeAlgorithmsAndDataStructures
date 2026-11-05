EDGES = "AB BC CA BD DE EF FD GF GH HI IG IJ".split()  # 有向圖
nodes = sorted({v for e in EDGES for v in e})
adj = {v: [] for v in nodes}
for a, b in EDGES:
    adj[a].append(b)

index, low, on_stack = {}, {}, set()
stack, sccs = [], []


def dfs(u):
    """low[u] = u 經由子樹與至多一條回邊能到達的最小編號；low == 編號時，u 是一個強連通分量的根"""
    index[u] = low[u] = len(index)
    stack.append(u)
    on_stack.add(u)
    for v in adj[u]:
        if v not in index:
            dfs(v)
            low[u] = min(low[u], low[v])
        elif v in on_stack:
            low[u] = min(low[u], index[v])
    if low[u] == index[u]:
        comp = []
        while True:
            v = stack.pop()
            on_stack.discard(v)
            comp.append(v)
            if v == u:
                break
        sccs.append(sorted(comp))


for v in nodes:
    if v not in index:
        dfs(v)
for c in sccs:
    print("SCC:", *c)
