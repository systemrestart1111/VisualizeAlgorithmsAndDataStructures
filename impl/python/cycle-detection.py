EDGES = "AB BC CD DB AE EF".split()  # 有向圖
adj = {}
for a, b in EDGES:
    adj.setdefault(a, []).append(b)
    adj.setdefault(b, [])

WHITE, GRAY, BLACK = 0, 1, 2
color = {v: WHITE for v in adj}
parent = {}


def dfs(u):
    """三色 DFS：遇到灰色（仍在遞迴堆疊上）的點就是一條回邊，代表有環"""
    color[u] = GRAY
    for v in adj[u]:
        if color[v] == GRAY:
            cycle = [v]
            x = u
            while x != v:
                cycle.append(x)
                x = parent[x]
            return [v] + cycle[1:][::-1] + [v]
        if color[v] == WHITE:
            parent[v] = u
            found = dfs(v)
            if found:
                return found
    color[u] = BLACK
    return None


for s in adj:
    if color[s] == WHITE:
        cyc = dfs(s)
        if cyc:
            print("cycle:", " -> ".join(cyc))
            break
else:
    print("no cycle")
