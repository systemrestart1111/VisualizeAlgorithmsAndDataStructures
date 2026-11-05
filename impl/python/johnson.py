INF = float("inf")
EDGES = [("A", "B", -2), ("A", "C", 4), ("B", "C", 3), ("B", "D", 2), ("B", "E", 6),
         ("C", "E", -1), ("D", "A", 1), ("D", "E", 5), ("E", "D", 2)]
nodes = "ABCDE"
n = len(nodes)
E = [(nodes.index(a), nodes.index(b), w) for a, b, w in EDGES]

# 1. 加一個虛擬點 q 連到所有點（權重 0），用 Bellman-Ford 求位能 h
h = [0] * n
for _ in range(n):
    for a, b, w in E:
        h[b] = min(h[b], h[a] + w)
if any(h[a] + w < h[b] for a, b, w in E):  # 再鬆弛一輪仍能變短：有負環
    print("negative cycle detected")
    raise SystemExit
print("h:", *h)

# 2. 重新加權 w'(u,v) = w + h[u] - h[v] >= 0，之後每個點各跑一次 Dijkstra
w2 = [[INF] * n for _ in range(n)]
for a, b, w in E:
    w2[a][b] = w + h[a] - h[b]


def dijkstra(s):
    dist, done = [INF] * n, [False] * n
    dist[s] = 0
    for _ in range(n):
        u = min((v for v in range(n) if not done[v] and dist[v] < INF), key=lambda v: dist[v], default=None)
        if u is None:
            break
        done[u] = True
        for v in range(n):
            if dist[u] + w2[u][v] < dist[v]:
                dist[v] = dist[u] + w2[u][v]
    return dist


# 3. 還原真實距離 d(u,v) = d'(u,v) - h[u] + h[v]
print("   " + "".join(f"{v:>4}" for v in nodes))
for s in range(n):
    d = dijkstra(s)
    print(f"{nodes[s]:>3}" + "".join(f"{'inf' if d[t] == INF else d[t] - h[s] + h[t]:>4}" for t in range(n)))
