from collections import deque

EDGES = "AB AD BC CD CF EF EB GH DG".split()
adj = {}
for a, b in EDGES:
    adj.setdefault(a, []).append(b)
    adj.setdefault(b, []).append(a)


def bipartite():
    """BFS 二著色：相鄰點必須不同色；若遇到同色的鄰居就不是二分圖"""
    color = {}
    for s in sorted(adj):
        if s in color:
            continue
        color[s] = 0
        q = deque([s])
        while q:
            u = q.popleft()
            for v in adj[u]:
                if v not in color:
                    color[v] = 1 - color[u]
                    q.append(v)
                elif color[v] == color[u]:
                    return None
    return color


c = bipartite()
if c is None:
    print("not bipartite")
else:
    print("set 0:", *sorted(v for v in c if c[v] == 0))
    print("set 1:", *sorted(v for v in c if c[v] == 1))
