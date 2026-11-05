from collections import deque

N = 16
N4 = [(-1, 0), (0, -1), (0, 1), (1, 0)]
N8 = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def blobs():
    return [[1 if (r - 5.5) ** 2 + (c - 5) ** 2 <= 16 or (r - 9) ** 2 + (c - 10.5) ** 2 <= 16 or (r - 13) ** 2 + (c - 2.5) ** 2 <= 3.5 else 0 for c in range(N)] for r in range(N)]


def noisy_bin():
    a, s = blobs(), 5
    for r in range(N):
        for c in range(N):
            s = s * 48271 % 2147483647
            if s % 100 < 6:
                a[r][c] = 1 - a[r][c]
    return a


def diag():
    return [[1 if ((r + c) % 4 == 0 and r % 2 == 0) or (r >= 10 and c >= 10 and (r + c) % 2 == 0) else 0 for c in range(N)] for r in range(N)]


def two_pass(A, conn):
    """第一趟看已掃過的鄰居，給新標籤或用並查集合併；第二趟換成代表並重新編號"""
    prev = [(-1, -1), (-1, 0), (-1, 1), (0, -1)] if conn == 8 else [(-1, 0), (0, -1)]
    lab = [[0] * N for _ in range(N)]
    parent = [0]

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for r in range(N):
        for c in range(N):
            if not A[r][c]:
                continue
            nbr = [lab[r + dr][c + dc] for dr, dc in prev if 0 <= r + dr < N and 0 <= c + dc < N and lab[r + dr][c + dc]]
            if not nbr:
                parent.append(len(parent))
                lab[r][c] = len(parent) - 1
            else:
                lab[r][c] = min(nbr)
                for v in nbr:
                    a, b = find(v), find(lab[r][c])
                    if a != b:
                        parent[max(a, b)] = min(a, b)
    remap = {}
    for r in range(N):
        for c in range(N):
            if lab[r][c]:
                root = find(lab[r][c])
                remap.setdefault(root, len(remap) + 1)
                lab[r][c] = remap[root]
    return lab, len(remap), len(parent) - 1


def bfs(A, conn):
    nb = N8 if conn == 8 else N4
    lab, n = [[0] * N for _ in range(N)], 0
    for r in range(N):
        for c in range(N):
            if A[r][c] and not lab[r][c]:
                n += 1
                lab[r][c] = n
                q = deque([(r, c)])
                while q:
                    y, x = q.popleft()
                    for dy, dx in nb:
                        if 0 <= y + dy < N and 0 <= x + dx < N and A[y + dy][x + dx] and not lab[y + dy][x + dx]:
                            lab[y + dy][x + dx] = n
                            q.append((y + dy, x + dx))
    return lab, n


for name, A in [("noisy blobs", noisy_bin()), ("blobs", blobs()), ("diagonal dots", diag())]:
    for conn in [4, 8]:
        lab, n, provisional = two_pass(A, conn)
        lb, nb = bfs(A, conn)
        pairs = {(lab[r][c], lb[r][c]) for r in range(N) for c in range(N) if A[r][c]}
        same = n == nb and len(pairs) == n
        sizes = sorted((sum(row.count(k) for row in lab) for k in range(1, n + 1)), reverse=True)
        print(f"{name}, {conn}-connected: {n} components ({provisional} provisional labels), sizes {sizes}, matches BFS {same}")
