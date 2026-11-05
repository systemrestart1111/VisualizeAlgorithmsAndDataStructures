EDGES = [("A", "B", 7), ("A", "D", 5), ("B", "C", 8), ("B", "D", 9), ("B", "E", 7), ("C", "E", 5),
         ("D", "E", 15), ("D", "F", 6), ("E", "F", 8), ("E", "G", 9), ("F", "G", 11)]
nodes = sorted({x for e in EDGES for x in e[:2]})
parent = {v: v for v in nodes}


def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x


# 每一輪：每個連通塊各自找一條最便宜的對外邊（同權重取編號小的），全部一起加入；塊數每輪至少減半
total, comps, rnd = 0, len(nodes), 0
while comps > 1:
    rnd += 1
    cheapest = {}
    for i, (a, b, w) in enumerate(EDGES):
        ra, rb = find(a), find(b)
        if ra == rb:
            continue
        for r in (ra, rb):
            if r not in cheapest or (w, i) < (EDGES[cheapest[r]][2], cheapest[r]):
                cheapest[r] = i
    taken = []
    for i in sorted(set(cheapest.values())):
        a, b, w = EDGES[i]
        if find(a) != find(b):
            parent[find(a)] = find(b)
            total += w
            comps -= 1
            taken.append(f"{a}-{b}({w})")
    print(f"round {rnd}:", *taken)
print("total weight =", total)
