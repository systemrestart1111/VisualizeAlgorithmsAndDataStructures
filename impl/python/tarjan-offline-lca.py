import sys

sys.setrecursionlimit(10000)
EDGES = [(1, 2), (1, 3), (2, 4), (2, 5), (3, 6), (3, 7), (5, 8), (5, 9), (7, 10)]
QUERIES = [(8, 9), (4, 8), (6, 10), (9, 6), (3, 3)]
children = {v: [] for e in EDGES for v in e}
for p, c in EDGES:
    children[p].append(c)

parent = {v: v for v in children}
ancestor, visited, ans = {}, set(), {}


def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x


def dfs(u):
    """子樹 v 完成後併入 u 的集合；u 結束時回答所有另一端已拜訪的查詢"""
    ancestor[u] = u
    for v in children[u]:
        dfs(v)
        parent[find(v)] = find(u)
        ancestor[find(u)] = u
    visited.add(u)
    for i, (a, b) in enumerate(QUERIES):
        w = b if a == u else a if b == u else None
        if w is not None and w in visited and i not in ans:
            ans[i] = ancestor[find(w)]


dfs(1)
for i, (a, b) in enumerate(QUERIES):
    print(f"lca({a}, {b}) = {ans[i]}")
