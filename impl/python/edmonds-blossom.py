from collections import deque

EDGES = [(1, 2), (2, 3), (3, 4), (4, 5), (5, 1), (3, 6), (6, 7), (7, 8), (8, 9), (9, 6), (5, 10)]
NODES = sorted({x for e in EDGES for x in e})
n = len(NODES)
ix = {v: i for i, v in enumerate(NODES)}
adj = [[] for _ in range(n)]
for a, b in EDGES:
    adj[ix[a]].append(ix[b])
    adj[ix[b]].append(ix[a])
match = [-1] * n


def augment_from(root):
    """BFS 交替樹；遇到奇環就把它收縮到共同的 base，找到未匹配點就沿路翻轉"""
    p, base, used = [-1] * n, list(range(n)), [False] * n
    used[root] = True
    q = deque([root])

    def lca(a, b):
        seen = [False] * n
        while True:
            a = base[a]
            seen[a] = True
            if match[a] < 0:
                break
            a = p[match[a]]
        while True:
            b = base[b]
            if seen[b]:
                return b
            b = p[match[b]]

    def mark(v, b, child, blossom):
        while base[v] != b:
            blossom[base[v]] = blossom[base[match[v]]] = True
            p[v] = child
            child = match[v]
            v = p[match[v]]

    while q:
        v = q.popleft()
        for u in adj[v]:
            if base[v] == base[u] or match[v] == u:
                continue
            if u == root or (match[u] >= 0 and p[match[u]] >= 0):
                cb = lca(v, u)
                blossom = [False] * n
                mark(v, cb, u, blossom)
                mark(u, cb, v, blossom)
                for i in range(n):
                    if blossom[base[i]]:
                        base[i] = cb
                        if not used[i]:
                            used[i] = True
                            q.append(i)
            elif p[u] < 0:
                p[u] = v
                if match[u] < 0:
                    while u >= 0:  # 沿增廣路翻轉
                        pv = p[u]
                        nxt = match[pv]
                        match[u], match[pv] = pv, u
                        u = nxt
                    return True
                used[match[u]] = True
                q.append(match[u])
    return False


size = sum(1 for r in range(n) if match[r] < 0 and augment_from(r))
pairs = sorted((NODES[i], NODES[match[i]]) for i in range(n) if match[i] > i)
valid = all((a, b) in EDGES or (b, a) in EDGES for a, b in pairs) and len({x for p in pairs for x in p}) == 2 * len(pairs)
memo = {}


def brute(mask):
    if mask in memo:
        return memo[mask]
    i = 0
    while i < n and (mask >> i) & 1:
        i += 1
    if i == n:
        return 0
    res = brute(mask | (1 << i))
    for u in adj[i]:
        if not (mask >> u) & 1:
            res = max(res, 1 + brute(mask | (1 << i) | (1 << u)))
    memo[mask] = res
    return res


print("maximum matching:", size, "| brute force:", brute(0), "| valid:", valid)
