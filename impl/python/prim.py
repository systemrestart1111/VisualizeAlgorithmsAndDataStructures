EDGES = [("A", "B", 7), ("A", "D", 5), ("B", "C", 8), ("B", "D", 9), ("B", "E", 7), ("C", "E", 5),
         ("D", "E", 15), ("D", "F", 6), ("E", "F", 8), ("E", "G", 9), ("F", "G", 11)]
nodes = sorted({x for e in EDGES for x in e[:2]})
INF = float("inf")
w = {(a, b): c for a, b, c in EDGES} | {(b, a): c for a, b, c in EDGES}

# key[v] = 把 v 接到目前這棵樹的最便宜邊；每次加入 key 最小的點，再更新鄰居的 key
key = {v: INF for v in nodes}
parent = {v: None for v in nodes}
in_tree = set()
key["A"] = 0
total = 0
for _ in nodes:
    u = min((v for v in nodes if v not in in_tree), key=lambda v: key[v])
    in_tree.add(u)
    if parent[u]:
        total += key[u]
        print(f"take {parent[u]}-{u} ({key[u]})")
    for v in nodes:
        if v not in in_tree and (u, v) in w and w[(u, v)] < key[v]:
            key[v], parent[v] = w[(u, v)], u
print("total weight =", total)
