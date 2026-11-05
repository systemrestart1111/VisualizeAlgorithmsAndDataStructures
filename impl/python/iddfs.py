EDGES = [("A", "B"), ("A", "C"), ("B", "D"), ("B", "E"), ("C", "F"), ("C", "G"), ("D", "H"), ("E", "I"), ("F", "J"), ("G", "K"), ("E", "F")]
adj = {}
for u, v in EDGES:
    adj.setdefault(u, []).append(v)
    adj.setdefault(v, []).append(u)
for k in adj:
    adj[k].sort()


def iddfs(s, t):
    """深度上限 0、1、2…逐一做深度受限 DFS；回傳 (路徑, 每輪拜訪數)"""
    counts = []
    for limit in range(len(adj) + 1):
        visits = 0
        path = []

        def dls(u, lim):
            nonlocal visits
            visits += 1
            path.append(u)
            if u == t:
                return True
            if lim > 0:
                for v in adj[u]:
                    if v not in path and dls(v, lim - 1):
                        return True
            path.pop()
            return False

        found = dls(s, limit)
        counts.append(visits)
        if found:
            return path, counts
    return None, counts


for t in ["J", "H", "A"]:
    path, counts = iddfs("A", t)
    print(f"A -> {t}: depth {len(path) - 1}, path {' -> '.join(path)}, visits per limit {counts}, total {sum(counts)}")
