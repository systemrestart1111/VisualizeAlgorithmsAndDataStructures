from collections import deque

PTS = [(2.1, 3.0), (2.8, 2.4), (3.4, 3.6), (2.5, 4.1), (3.9, 2.7), (1.8, 2.2), (3.0, 3.1), (2.2, 3.8),
       (7.0, 7.4), (7.8, 6.6), (8.3, 7.9), (6.9, 6.4), (7.5, 8.2), (8.6, 6.9), (7.2, 7.0),
       (6.6, 2.1), (7.4, 2.9), (7.9, 2.2), (6.9, 3.2),
       (5.0, 5.2), (0.5, 9.0), (9.5, 0.6), (4.6, 8.8)]


def dbscan(P, eps, min_pts):
    """N(p) 含 p 自己；|N(p)| ≥ minPts 為核心點；從核心點 BFS 擴張，其餘為雜訊"""
    nb = [[j for j, q in enumerate(P) if (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 <= eps * eps] for p in P]
    core = [len(s) >= min_pts for s in nb]
    lab = [-1] * len(P)
    c = -1
    for i in range(len(P)):
        if lab[i] >= 0 or not core[i]:
            continue
        c += 1
        lab[i] = c
        q = deque([i])
        while q:
            cur = q.popleft()
            for j in nb[cur]:
                if lab[j] < 0:
                    lab[j] = c
                    if core[j]:
                        q.append(j)
    return lab, core, c + 1


for eps, mp in [(1.2, 4), (0.8, 4), (2.0, 4), (1.2, 3), (1.2, 6)]:
    lab, core, k = dbscan(PTS, eps, mp)
    border = sum(1 for i in range(len(PTS)) if lab[i] >= 0 and not core[i])
    print(f"eps {eps}, minPts {mp}: {k} clusters, core {sum(core)}, border {border}, noise {lab.count(-1)}; labels {' '.join(map(str, lab))}")
