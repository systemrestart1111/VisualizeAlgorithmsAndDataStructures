INF = float("inf")
EDGES = [("A", "B", 3), ("A", "C", 8), ("A", "E", -4), ("B", "D", 1), ("B", "E", 7),
         ("C", "B", 4), ("D", "A", 2), ("D", "C", -5), ("E", "D", 6)]
nodes = "ABCDE"
n = len(nodes)
d = [[0 if i == j else INF for j in range(n)] for i in range(n)]
for a, b, w in EDGES:
    d[nodes.index(a)][nodes.index(b)] = w

# 依序允許經過中繼點 k：d[i][j] = min(d[i][j], d[i][k] + d[k][j])
for k in range(n):
    for i in range(n):
        for j in range(n):
            if d[i][k] + d[k][j] < d[i][j]:
                d[i][j] = d[i][k] + d[k][j]

print("   " + "".join(f"{v:>4}" for v in nodes))
for i in range(n):
    print(f"{nodes[i]:>3}" + "".join(f"{'inf' if d[i][j] == INF else d[i][j]:>4}" for j in range(n)))
