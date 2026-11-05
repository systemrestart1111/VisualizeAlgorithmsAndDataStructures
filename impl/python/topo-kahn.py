from collections import deque

EDGES = "AC BC BD CE DF EF EG FH GH".split()  # 有向無環圖
nodes = sorted({v for e in EDGES for v in e})
adj = {v: [] for v in nodes}
indeg = {v: 0 for v in nodes}
for a, b in EDGES:
    adj[a].append(b)
    indeg[b] += 1

# 反覆取出入度為 0 的點，並把它的出邊刪掉（讓鄰居入度減 1）
q = deque(v for v in nodes if indeg[v] == 0)
order = []
while q:
    u = q.popleft()
    order.append(u)
    for v in adj[u]:
        indeg[v] -= 1
        if indeg[v] == 0:
            q.append(v)
print("order:", *order) if len(order) == len(nodes) else print("graph has a cycle")
