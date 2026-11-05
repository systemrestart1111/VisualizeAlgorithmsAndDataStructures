EDGES = "AB BC CA DE FG GH HF FI".split()
NODES = "ABCDEFGHIJ"  # J 是孤立點
parent = {v: v for v in NODES}


def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]  # 路徑壓縮
        x = parent[x]
    return x


# 用並查集合併每條邊的兩端，最後同一個根的點屬於同一個連通分量
for a, b in EDGES:
    parent[find(a)] = find(b)

groups = {}
for v in NODES:
    groups.setdefault(find(v), []).append(v)
print("components:", len(groups))
for g in groups.values():
    print(" ", *g)
