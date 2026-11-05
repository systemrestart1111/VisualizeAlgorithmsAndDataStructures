from collections import deque

EDGES = [("A", "B", 0), ("A", "C", 1), ("B", "D", 1), ("B", "C", 0), ("C", "E", 1),
         ("D", "E", 0), ("D", "F", 1), ("E", "G", 0), ("F", "G", 1), ("E", "F", 1)]
adj = {}
for a, b, w in EDGES:  # 無向圖，邊權只有 0 或 1
    adj.setdefault(a, []).append((b, w))
    adj.setdefault(b, []).append((a, w))

# 雙端佇列：權重 0 的鄰居放前面、權重 1 的放後面，佇列始終依距離排序，效果等同 Dijkstra 但只需 O(V+E)
dist = {v: float("inf") for v in adj}
dist["A"] = 0
dq = deque(["A"])
while dq:
    u = dq.popleft()
    for v, w in adj[u]:
        if dist[u] + w < dist[v]:
            dist[v] = dist[u] + w
            if w == 0:
                dq.appendleft(v)
            else:
                dq.append(v)
print("dist:", " ".join(f"{v}={dist[v]}" for v in sorted(dist)))
