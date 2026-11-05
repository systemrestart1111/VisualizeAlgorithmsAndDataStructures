EDGES = "AB AC AD BC BE CD CE DF EF CF".split()
nodes = sorted({v for e in EDGES for v in e})
adj = {v: set() for v in nodes}
for a, b in EDGES:
    adj[a].add(b)
    adj[b].add(a)


def color_graph(m):
    """依序替每個點試顏色 1..m，與已著色的鄰居衝突就換色；都不行就回溯到上一個點"""
    color = {}

    def bt(i):
        if i == len(nodes):
            return True
        v = nodes[i]
        for c in range(1, m + 1):
            if all(color.get(u) != c for u in adj[v]):
                color[v] = c
                if bt(i + 1):
                    return True
                del color[v]
        return False

    return color if bt(0) else None


for m in (3, 4):
    res = color_graph(m)
    print(f"m = {m}:", "no solution" if res is None else " ".join(f"{v}={res[v]}" for v in nodes))
