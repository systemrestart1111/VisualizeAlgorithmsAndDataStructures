EDGES = "AB BC CA BD DE EF FD GF GH HI IG IJ".split()
nodes = sorted({v for e in EDGES for v in e})
adj = {v: [] for v in nodes}
radj = {v: [] for v in nodes}
for a, b in EDGES:
    adj[a].append(b)
    radj[b].append(a)  # 反向圖

order, seen = [], set()


def dfs1(u):  # 第一次 DFS：記錄完成順序
    seen.add(u)
    for v in adj[u]:
        if v not in seen:
            dfs1(v)
    order.append(u)


def dfs2(u, comp):  # 第二次 DFS：在反向圖上，依完成時間由晚到早出發
    seen.add(u)
    comp.append(u)
    for v in radj[u]:
        if v not in seen:
            dfs2(v, comp)


for v in nodes:
    if v not in seen:
        dfs1(v)
seen.clear()
for u in reversed(order):
    if u not in seen:
        comp = []
        dfs2(u, comp)
        print("SCC:", *sorted(comp))
