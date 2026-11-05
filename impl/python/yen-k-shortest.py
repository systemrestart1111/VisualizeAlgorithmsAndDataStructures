EDGES = [("C", "D", 3), ("C", "E", 2), ("D", "F", 4), ("E", "D", 1), ("E", "F", 2), ("E", "G", 3), ("F", "G", 2), ("F", "H", 1), ("G", "H", 2)]
NODES = sorted({x for e in EDGES for x in e[:2]})
ADJ = {v: sorted((e[1], e[2], i) for i, e in enumerate(EDGES) if e[0] == v) for v in NODES}


def dijkstra(s, t, ban_e, ban_n):
    """同距離時取名稱較小的點；只有嚴格更短才更新前驅"""
    dist, prev, done = {s: 0}, {}, set()
    while True:
        cand = [v for v in NODES if v not in done and v in dist and v not in ban_n]
        if not cand:
            return None
        u = min(cand, key=lambda v: (dist[v], v))
        if u == t:
            break
        done.add(u)
        for v, w, i in ADJ[u]:
            if i not in ban_e and v not in ban_n and (v not in dist or dist[u] + w < dist[v]):
                dist[v], prev[v] = dist[u] + w, i
    nodes, edges = [t], []
    while nodes[0] != s:
        i = prev[nodes[0]]
        edges.insert(0, i)
        nodes.insert(0, EDGES[i][0])
    return nodes, edges, dist[t]


def yen(s, t, K):
    first = dijkstra(s, t, set(), set())
    if first is None:
        return []
    A, B = [first], []
    for _ in range(1, K):
        last = A[-1]
        for i in range(len(last[0]) - 1):
            root_n, root_e = last[0][:i + 1], last[1][:i]
            ban_e = {p[1][i] for p in A if p[0][:i + 1] == root_n}
            spur = dijkstra(last[0][i], t, ban_e, set(root_n[:-1]))
            if spur:
                cand = (root_n + spur[0][1:], root_e + spur[1], sum(EDGES[e][2] for e in root_e) + spur[2])
                if all(p[0] != cand[0] for p in A + B):
                    B.append(cand)
        if not B:
            break
        B.sort(key=lambda p: (p[2], len(p[0]), ",".join(p[0])))
        A.append(B.pop(0))
    return A


for k, (nodes, _, cost) in enumerate(yen("C", "H", 4), 1):
    print(f"{k}: {' -> '.join(nodes)} cost {cost}")
