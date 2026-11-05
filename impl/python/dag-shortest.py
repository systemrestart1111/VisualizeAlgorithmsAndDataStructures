from collections import deque

EDGES = [("A", "B", 5), ("A", "C", 3), ("B", "C", 2), ("B", "D", 6), ("C", "D", 7),
         ("C", "E", 4), ("C", "F", 2), ("D", "E", -1), ("D", "F", 1), ("E", "F", -2)]
nodes = sorted({x for e in EDGES for x in e[:2]})
adj = {v: [] for v in nodes}
indeg = {v: 0 for v in nodes}
for a, b, w in EDGES:
    adj[a].append((b, w))
    indeg[b] += 1

# 先求拓撲順序；依此順序鬆弛，處理到某點時它的所有前驅都已確定，因此負權也沒問題
q = deque(v for v in nodes if indeg[v] == 0)
topo = []
while q:
    u = q.popleft()
    topo.append(u)
    for v, _ in adj[u]:
        indeg[v] -= 1
        if indeg[v] == 0:
            q.append(v)

dist = {v: float("inf") for v in nodes}
dist["A"] = 0
for u in topo:
    if dist[u] < float("inf"):
        for v, w in adj[u]:
            dist[v] = min(dist[v], dist[u] + w)
print("topological order:", *topo)
print("dist:", " ".join(f"{v}={dist[v]}" for v in nodes))
