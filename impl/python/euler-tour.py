EDGES = [(1, 2), (1, 3), (2, 4), (2, 5), (3, 6), (5, 7), (6, 8)]
children = {}
for p, c in EDGES:
    children.setdefault(p, []).append(c)

tour, tin, tout = [], {}, {}


def dfs(u):
    """進入節點時記錄一次，每從一個子節點返回再記錄一次；子樹 u 對應 tour[tin[u]..tout[u]]"""
    tin[u] = len(tour)
    tour.append(u)
    for v in children.get(u, []):
        dfs(v)
        tour.append(u)
    tout[u] = len(tour) - 1


dfs(1)
print("tour:", *tour)
for u in sorted(tin):
    print(f"node {u}: tin = {tin[u]}, tout = {tout[u]}")
