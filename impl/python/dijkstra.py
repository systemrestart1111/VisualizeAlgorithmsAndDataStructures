import heapq

EDGES = [("A", "B", 4), ("A", "C", 2), ("B", "C", 5), ("B", "D", 10), ("C", "E", 3),
         ("E", "D", 4), ("D", "F", 11), ("E", "F", 8), ("C", "F", 12), ("B", "E", 6)]
adj = {}
for a, b, w in EDGES:  # 無向圖
    adj.setdefault(a, []).append((b, w))
    adj.setdefault(b, []).append((a, w))


def dijkstra(src):
    """每次取出目前距離最小且尚未確定的點，確定它的距離並鬆弛所有出邊（邊權須非負）"""
    dist, parent = {v: float("inf") for v in adj}, {src: None}
    dist[src] = 0
    pq, done = [(0, src)], set()
    while pq:
        d, u = heapq.heappop(pq)
        if u in done:
            continue
        done.add(u)
        for v, w in adj[u]:
            if d + w < dist[v]:
                dist[v], parent[v] = d + w, u
                heapq.heappush(pq, (dist[v], v))
    return dist, parent


dist, parent = dijkstra("A")
for v in sorted(adj):
    path, x = [], v
    while x:
        path.append(x)
        x = parent[x]
    print(f"{v}: {dist[v]:>2}  path {' -> '.join(reversed(path))}")
