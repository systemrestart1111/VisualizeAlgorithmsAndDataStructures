EDGES = [(1, 2, 2), (1, 5, 3), (2, 3, 3), (2, 5, 2), (2, 6, 2), (3, 4, 4), (3, 7, 2), (4, 7, 2), (4, 8, 2), (5, 6, 3), (6, 7, 1), (7, 8, 3)]
NODES = []
for u, v, _ in EDGES:
    for x in (u, v):
        if x not in NODES:
            NODES.append(x)


def stoer_wagner():
    """每階段做最大鄰接排序，切出最後加入的點，再把最後兩點合併"""
    n = len(NODES)
    W = [[0] * n for _ in range(n)]
    for u, v, w in EDGES:
        a, b = NODES.index(u), NODES.index(v)
        W[a][b] += w
        W[b][a] += w
    members = [[x] for x in NODES]
    alive = [True] * n
    best, best_set, phases = float("inf"), [], []
    for _ in range(n - 1):
        ids = [i for i in range(n) if alive[i]]
        w = [W[ids[0]][v] for v in range(n)]
        order, inA = [ids[0]], {ids[0]}
        while len(order) < len(ids):
            nxt = max((v for v in ids if v not in inA), key=lambda v: (w[v], -ids.index(v)))
            inA.add(nxt)
            order.append(nxt)
            for v in ids:
                if v not in inA:
                    w[v] += W[nxt][v]
        s, t = order[-2], order[-1]
        cut = sum(W[t][v] for v in ids if v != t)
        phases.append(cut)
        if cut < best:
            best, best_set = cut, members[t][:]
        for v in range(n):
            W[s][v] += W[t][v]
            W[v][s] = W[s][v]
        members[s] += members[t]
        alive[t] = False
    return best, best_set, phases


best, side, phases = stoer_wagner()
print("cut of each phase:", *phases)
print("min cut:", best, "side:", sorted(side))
