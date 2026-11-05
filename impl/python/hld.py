EDGES = [(1, 2), (1, 3), (1, 4), (2, 5), (2, 6), (3, 7), (5, 8), (5, 9), (5, 10), (7, 11), (9, 12), (4, 13), (13, 14)]
N = 15
children = [[] for _ in range(N)]
for p, c in EDGES:
    children[p].append(c)
parent, depth, size, heavy = [0] * N, [0] * N, [1] * N, [0] * N
head, pos, order = [0] * N, [0] * N, []


def dfs_size(u):
    """計算子樹大小；子樹最大的孩子是重兒子（相同時取先出現的）"""
    for v in children[u]:
        parent[v], depth[v] = u, depth[u] + 1
        dfs_size(v)
        size[u] += size[v]
        if heavy[u] == 0 or size[v] > size[heavy[u]]:
            heavy[u] = v


def decompose(u, h):
    """沿重兒子延伸同一條重鏈（head 相同、pos 連續），輕兒子各自開新鏈"""
    head[u], pos[u] = h, len(order)
    order.append(u)
    if heavy[u]:
        decompose(heavy[u], h)
    for v in children[u]:
        if v != heavy[u]:
            decompose(v, v)


def path_segments(a, b):
    """路徑 a–b 拆成 O(log n) 段，每段都是重鏈上 pos 連續的一段"""
    segs = []
    while head[a] != head[b]:
        if depth[head[a]] < depth[head[b]]:
            a, b = b, a
        segs.append(order[pos[head[a]]:pos[a] + 1])
        a = parent[head[a]]
    lo, hi = sorted((pos[a], pos[b]))
    segs.append(order[lo:hi + 1])
    return segs


dfs_size(1)
decompose(1, 1)
print("chains:")
for u in order:
    if head[u] == u:
        chain, v = [], u
        while v:
            chain.append(v)
            v = heavy[v]
        print(" ", *chain)
print("path(12, 14) segments:")
for s in path_segments(12, 14):
    print(" ", *s)
