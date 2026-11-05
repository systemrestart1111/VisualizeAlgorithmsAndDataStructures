from collections import deque


def longest_path(nodes, edges, s):
    """依拓撲順序放鬆最大距離（可有負權）；有環時回傳 None"""
    adj = {v: [] for v in nodes}
    indeg = {v: 0 for v in nodes}
    for u, v, w in edges:
        adj[u].append((v, w))
        indeg[v] += 1
    for v in adj:
        adj[v].sort()
    q = deque(v for v in nodes if indeg[v] == 0)
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v, _ in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    if len(order) != len(nodes):
        return None
    NEG = float("-inf")
    dist, par = {v: NEG for v in nodes}, {}
    dist[s] = 0
    for u in order:
        if dist[u] == NEG:
            continue
        for v, w in adj[u]:
            if dist[u] + w > dist[v]:
                dist[v], par[v] = dist[u] + w, u
    end = max(nodes, key=lambda v: (dist[v], -nodes.index(v)))
    path = [end]
    while path[0] != s:
        path.insert(0, par[path[0]])
    return dist, path


nodes = ["S", "A", "B", "C", "D", "E", "F"]
edges = [("S", "A", 3), ("S", "B", 2), ("A", "C", 4), ("B", "C", 1), ("B", "D", 5), ("C", "E", -2), ("D", "E", 3), ("A", "D", 1), ("E", "F", 2)]
dist, path = longest_path(nodes, edges, "S")
print("dist:", " ".join(f"{v}={dist[v]}" for v in nodes))
print("longest:", " -> ".join(path), "length", dist[path[-1]])
print("with cycle:", longest_path(["X", "Y"], [("X", "Y", 1), ("Y", "X", 1)], "X"))
