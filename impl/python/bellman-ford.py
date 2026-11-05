EDGES = [("A", "B", 6), ("A", "C", 7), ("B", "D", 5), ("B", "C", 8), ("B", "E", -4),
         ("C", "D", -3), ("C", "E", 9), ("D", "B", -2), ("E", "D", 7), ("E", "A", 2)]  # 有向圖，可含負權
nodes = sorted({x for e in EDGES for x in e[:2]})


def bellman_ford(src):
    """對所有邊做 V-1 輪鬆弛；第 V 輪若還能變短，代表有負環"""
    dist = {v: float("inf") for v in nodes}
    dist[src] = 0
    for _ in range(len(nodes) - 1):
        changed = False
        for a, b, w in EDGES:
            if dist[a] + w < dist[b]:
                dist[b] = dist[a] + w
                changed = True
        if not changed:
            break
    neg = any(dist[a] + w < dist[b] for a, b, w in EDGES)
    return dist, neg


dist, neg = bellman_ford("A")
print("dist:", " ".join(f"{v}={dist[v]}" for v in nodes))
print("negative cycle:", neg)
