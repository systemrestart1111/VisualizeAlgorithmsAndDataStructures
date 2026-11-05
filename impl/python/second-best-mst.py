EDGES = [("A", "B", 4), ("A", "C", 3), ("B", "C", 1), ("B", "D", 2), ("C", "D", 4), ("C", "E", 5), ("D", "E", 6), ("D", "F", 7), ("E", "F", 3)]
nodes = sorted({x for e in EDGES for x in e[:2]})


def kruskal():
    p = {v: v for v in nodes}

    def find(x):
        while p[x] != x:
            p[x] = p[p[x]]
            x = p[x]
        return x

    tree = []
    for i in sorted(range(len(EDGES)), key=lambda i: (EDGES[i][2], i)):
        a, b = find(EDGES[i][0]), find(EDGES[i][1])
        if a != b:
            p[a] = b
            tree.append(i)
    return tree


def path_edges(tree, a, b):
    """樹上 a 到 b 的路徑（回傳邊的編號）"""
    adj = {v: [] for v in nodes}
    for i in tree:
        u, v, _ = EDGES[i]
        adj[u].append((v, i))
        adj[v].append((u, i))
    prev, q = {a: (None, None)}, [a]
    for x in q:
        for y, i in adj[x]:
            if y not in prev:
                prev[y] = (x, i)
                q.append(y)
    out, x = [], b
    while x != a:
        x, i = prev[x]
        out.append(i)
    return out


tree = kruskal()
W = sum(EDGES[i][2] for i in tree)
print("MST weight:", W, "edges:", " ".join(f"{EDGES[i][0]}{EDGES[i][1]}" for i in tree))
for strict in (False, True):
    best = None
    for i, (u, v, w) in enumerate(EDGES):
        if i in tree:
            continue
        cand = [j for j in path_edges(tree, u, v) if not strict or EDGES[j][2] < w]
        if cand:
            m = max(EDGES[j][2] for j in cand)
            best = W - m + w if best is None else min(best, W - m + w)
    print("strict" if strict else "allow equal", "second best:", best)
