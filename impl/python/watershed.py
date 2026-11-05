import heapq
import math

N = 16
N4 = [(-1, 0), (0, -1), (0, 1), (1, 0)]


def terrain(name):
    if name == "two basins":
        return [[min((r - 4) ** 2 + (c - 4) ** 2, (r - 11) ** 2 + (c - 11) ** 2) // 4 for c in range(N)] for r in range(N)]
    B = [[1 if (r - 5.5) ** 2 + (c - 5) ** 2 <= 16 or (r - 9) ** 2 + (c - 10.5) ** 2 <= 16 or (r - 13) ** 2 + (c - 2.5) ** 2 <= 3.5 else 0 for c in range(N)] for r in range(N)]
    bg = [(r, c) for r in range(N) for c in range(N) if not B[r][c]]
    return [[-math.floor(min(math.hypot(y - r, x - c) for y, x in bg) * 10 + 0.5) / 10 if B[r][c] else 1 for c in range(N)] for r in range(N)]


def watershed(H):
    """區域極小值各給一個編號；優先佇列每次取最低者（同高度先進先出），把未標記的鄰居標成同一編號"""
    lab = [[0] * N for _ in range(N)]
    seen = [[False] * N for _ in range(N)]
    n = 0
    for i in range(N):
        for j in range(N):
            if seen[i][j]:
                continue
            comp, k, is_min = [(i, j)], 0, True
            seen[i][j] = True
            while k < len(comp):
                y, x = comp[k]
                k += 1
                for dy, dx in N4:
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < N and 0 <= xx < N:
                        if H[yy][xx] < H[i][j]:
                            is_min = False
                        elif H[yy][xx] == H[i][j] and not seen[yy][xx]:
                            seen[yy][xx] = True
                            comp.append((yy, xx))
            if is_min:
                n += 1
                for y, x in comp:
                    lab[y][x] = n
    heap, seq = [], 0
    for i in range(N):
        for j in range(N):
            if lab[i][j]:
                heapq.heappush(heap, (H[i][j], seq, i, j))
                seq += 1
    while heap:
        _, _, i, j = heapq.heappop(heap)
        for dy, dx in N4:
            y, x = i + dy, j + dx
            if 0 <= y < N and 0 <= x < N and not lab[y][x]:
                lab[y][x] = lab[i][j]
                heapq.heappush(heap, (H[y][x], seq, y, x))
                seq += 1
    return n, lab


for name in ["blob distance", "two basins"]:
    n, lab = watershed(terrain(name))
    sizes = sorted((sum(row.count(k) for row in lab) for k in range(1, n + 1)), reverse=True)
    boundary = sum(1 for r in range(N) for c in range(N) if (c + 1 < N and lab[r][c + 1] != lab[r][c]) or (r + 1 < N and lab[r + 1][c] != lab[r][c]))
    print(f"{name}: {n} regions, sizes {sizes}, watershed boundary pixels {boundary}")
