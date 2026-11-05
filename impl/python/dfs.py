EDGES = "AB AC BD BE CF EF DG EG FH GH".split()
adj = {}
for a, b in EDGES:
    adj.setdefault(a, []).append(b)
    adj.setdefault(b, []).append(a)

order, seen = [], set()


def dfs(u):
    """沿著一條路一直走到底，無路可走才回溯（遞迴本身就是堆疊）"""
    seen.add(u)
    order.append(u)
    for v in adj[u]:
        if v not in seen:
            dfs(v)


dfs("A")
print("order:", *order)
