from collections import deque

N = 16
N4 = [(-1, 0), (0, -1), (0, 1), (1, 0)]
N8 = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def blobs():
    return [[1 if (r - 5.5) ** 2 + (c - 5) ** 2 <= 16 or (r - 9) ** 2 + (c - 10.5) ** 2 <= 16 or (r - 13) ** 2 + (c - 2.5) ** 2 <= 3.5 else 0 for c in range(N)] for r in range(N)]


def shapes_bin():
    a = [[0] * N for _ in range(N)]
    for r in range(N):
        for c in range(N):
            if 2 <= r <= 6 and 2 <= c <= 7:
                a[r][c] = 1
            if (r - 10.5) ** 2 + (c - 10.5) ** 2 <= 12.96:
                a[r][c] = 1
    return a


def distance(B, nb):
    """所有背景像素同時入列的多源 BFS：4 鄰接得 L1、8 鄰接得 L∞（都不是歐氏距離）"""
    INF = 10 ** 9
    d = [[INF if B[r][c] else 0 for c in range(N)] for r in range(N)]
    q = deque((r, c) for r in range(N) for c in range(N) if not B[r][c])
    while q:
        r, c = q.popleft()
        for dr, dc in nb:
            y, x = r + dr, c + dc
            if 0 <= y < N and 0 <= x < N and d[y][x] == INF:
                d[y][x] = d[r][c] + 1
                q.append((y, x))
    return d


for name, B in [("blobs", blobs()), ("shapes", shapes_bin())]:
    bg = [(r, c) for r in range(N) for c in range(N) if not B[r][c]]
    for metric, nb in [("L1", N4), ("Linf", N8)]:
        d = distance(B, nb)
        mx = max(map(max, d))
        hist = [sum(row.count(k) for row in d) for k in range(1, mx + 1)]
        f = (lambda y, x, r, c: abs(y - r) + abs(x - c)) if metric == "L1" else (lambda y, x, r, c: max(abs(y - r), abs(x - c)))
        ok = all(d[r][c] == min(f(y, x, r, c) for y, x in bg) for r in range(N) for c in range(N) if B[r][c])
        print(f"{name}, {metric}: max distance {mx}, pixels per distance {hist}, matches brute force {ok}")
