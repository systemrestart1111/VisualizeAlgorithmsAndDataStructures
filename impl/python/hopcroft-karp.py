from collections import deque

ADJ = {1: [1, 2], 2: [1, 3], 3: [2, 3], 4: [3, 4], 5: [4, 5]}  # 左側 L1..L5 可以配對的右側點
NL = NR = 5
match_l, match_r = [0] * (NL + 1), [0] * (NR + 1)
dist = [0] * (NL + 1)
INF = float("inf")


def bfs():
    """從所有未配對的左側點同時 BFS，分層；回傳是否存在增廣路徑"""
    q = deque()
    for u in range(1, NL + 1):
        dist[u] = 0 if match_l[u] == 0 else INF
        if match_l[u] == 0:
            q.append(u)
    found = False
    while q:
        u = q.popleft()
        for v in ADJ[u]:
            w = match_r[v]
            if w == 0:
                found = True
            elif dist[w] == INF:
                dist[w] = dist[u] + 1
                q.append(w)
    return found


def dfs(u):
    """沿分層找一條最短增廣路徑並翻轉"""
    for v in ADJ[u]:
        w = match_r[v]
        if w == 0 or (dist[w] == dist[u] + 1 and dfs(w)):
            match_l[u], match_r[v] = v, u
            return True
    dist[u] = INF
    return False


# 每一階段找出一組互不相交的最短增廣路徑一起翻轉，總共只需 O(√V) 階段
size, phases = 0, 0
while bfs():
    phases += 1
    for u in range(1, NL + 1):
        if match_l[u] == 0 and dfs(u):
            size += 1
print("phases =", phases, "matching size =", size)
for u in range(1, NL + 1):
    print(f"L{u} - R{match_l[u]}")
