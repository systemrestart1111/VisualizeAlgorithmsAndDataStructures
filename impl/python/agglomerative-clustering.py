import heapq
import math

PTS = [(1.8, 2.5), (3.1, 3.4), (2.2, 4.0), (3.0, 2.1), (6.4, 7.0), (7.6, 8.1), (7.2, 6.6), (6.6, 8.4), (8.1, 2.9), (7.0, 2.0), (7.9, 1.6)]


def agglomerative(P, linkage, k):
    """最小堆存所有群對距離；取出時若有一群已被合併就略過（延遲刪除）"""
    n = len(P)
    d = lambda i, j: math.sqrt((P[i][0] - P[j][0]) ** 2 + (P[i][1] - P[j][1]) ** 2)

    def link(A, B):
        ds = [d(i, j) for i in A for j in B]
        return min(ds) if linkage == "single" else max(ds) if linkage == "complete" else sum(ds) / len(ds)

    clusters = {i: [i] for i in range(n)}
    heap = [(link([i], [j]), i, j) for i in range(n) for j in range(i + 1, n)]
    heapq.heapify(heap)
    nxt, merges, history = n, [], []
    while len(clusters) > 1:
        dist, a, b = heapq.heappop(heap)
        if a not in clusters or b not in clusters:
            continue
        A, B = clusters.pop(a), clusters.pop(b)
        merges.append(f"{{{','.join(map(str, sorted(A)))}}}+{{{','.join(map(str, sorted(B)))}}}@{dist:.3f}")
        history.append((a, b))
        clusters[nxt] = A + B
        for cid, mem in clusters.items():
            if cid != nxt:
                heapq.heappush(heap, (link(mem, A + B), min(cid, nxt), max(cid, nxt)))
        nxt += 1
    groups = {i: [i] for i in range(n)}
    for step, (a, b) in enumerate(history[:n - k]):
        groups[n + step] = groups.pop(a) + groups.pop(b)
    return merges, sorted(sorted(g) for g in groups.values())


for linkage in ["single", "complete", "average"]:
    merges, groups = agglomerative(PTS, linkage, 3)
    print(f"{linkage}: " + " ".join(merges))
    print(f"  3 clusters: " + " ".join("{" + ",".join(map(str, g)) + "}" for g in groups))
