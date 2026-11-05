def closure(nodes, edges, reflexive=False):
    """Warshall：依序讓每個頂點 k 當中繼站，R[i][j] |= R[i][k] and R[k][j]"""
    n = len(nodes)
    idx = {v: i for i, v in enumerate(nodes)}
    R = [[1 if (reflexive and i == j) else 0 for j in range(n)] for i in range(n)]
    for u, v in edges:
        R[idx[u]][idx[v]] = 1
    for k in range(n):
        for i in range(n):
            for j in range(n):
                R[i][j] = R[i][j] or (R[i][k] and R[k][j])
    return R


nodes = ["A", "B", "C", "D", "E", "F"]
edges = [("A", "B"), ("B", "C"), ("C", "A"), ("C", "D"), ("E", "D"), ("E", "F")]
for refl in (False, True):
    R = closure(nodes, edges, refl)
    print("reflexive" if refl else "non-reflexive")
    print("  " + " ".join(nodes))
    for v, row in zip(nodes, R):
        print(v, " ".join(map(str, row)))
