EDGES = [("A", "B", 7), ("A", "D", 5), ("B", "C", 8), ("B", "D", 9), ("B", "E", 7), ("C", "E", 5),
         ("D", "E", 15), ("D", "F", 6), ("E", "F", 8), ("E", "G", 9), ("F", "G", 11)]
parent = {}


def find(x):
    parent.setdefault(x, x)
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x


# 邊依權重由小到大檢查；兩端不在同一棵樹（並查集）才加入，避免形成環
total = 0
for a, b, w in sorted(EDGES, key=lambda e: e[2]):  # sorted 是穩定排序，同權重保持輸入順序
    ra, rb = find(a), find(b)
    if ra != rb:
        parent[ra] = rb
        total += w
        print(f"take {a}-{b} ({w})")
print("total weight =", total)
