EDGES = "AB BC CA CD DE EC BD AD".split()
nodes = sorted({v for e in EDGES for v in e})
adj = {v: [] for v in nodes}  # adj[u] = [(鄰居, 邊編號)]
for i, (a, b) in enumerate(EDGES):
    adj[a].append((b, i))
    adj[b].append((a, i))

odd = [v for v in nodes if len(adj[v]) % 2]
start = odd[0] if odd else nodes[0]  # 有兩個奇點時必須從奇點出發
used = [False] * len(EDGES)
ptr = {v: 0 for v in nodes}

# 沿著未用過的邊一直走，走不動時把該點加入路徑並回退；最後路徑反轉即為歐拉路徑
stack, path = [start], []
while stack:
    u = stack[-1]
    while ptr[u] < len(adj[u]) and used[adj[u][ptr[u]][1]]:
        ptr[u] += 1
    if ptr[u] == len(adj[u]):
        path.append(stack.pop())
    else:
        v, i = adj[u][ptr[u]]
        used[i] = True
        stack.append(v)
print("odd vertices:", *odd)
print("euler path:", " -> ".join(reversed(path)))
