from collections import deque

EDGES = "AB AC BD BE CF EF DG EG FH GH".split()  # 無向圖，每兩個字母是一條邊
adj = {}
for a, b in EDGES:
    adj.setdefault(a, []).append(b)
    adj.setdefault(b, []).append(a)


def bfs(start):
    """佇列先進先出：先處理完距離 d 的所有點，才輪到距離 d+1"""
    dist = {start: 0}
    order, q = [], deque([start])
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            if v not in dist:
                dist[v] = dist[u] + 1
                q.append(v)
    return order, dist


order, dist = bfs("A")
print("order:", *order)
print("dist:", " ".join(f"{v}={dist[v]}" for v in sorted(dist)))
