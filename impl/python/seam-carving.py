N = 16


def preset(name):
    a = [[30] * N for _ in range(N)]
    for r in range(N):
        for c in range(N):
            if name == "step":
                a[r][c] = (60 if c < 8 else 190) + (40 if r >= 11 else 0)
                continue
            if 2 <= r <= 6 and 2 <= c <= 7:
                a[r][c] = 200
            if (r - 10.5) ** 2 + (c - 10.5) ** 2 <= 12.96:
                a[r][c] = 140
            if 9 <= r <= 14 and 1 <= c <= r - 8:
                a[r][c] = 90
    return a


def energy(A):
    """e = |Gx| + |Gy|（Sobel，邊界複製）"""
    H, W = len(A), len(A[0])
    g = lambda r, c: A[min(H - 1, max(0, r))][min(W - 1, max(0, c))]
    e = []
    for r in range(H):
        row = []
        for c in range(W):
            gx = g(r - 1, c + 1) + 2 * g(r, c + 1) + g(r + 1, c + 1) - g(r - 1, c - 1) - 2 * g(r, c - 1) - g(r + 1, c - 1)
            gy = g(r + 1, c - 1) + 2 * g(r + 1, c) + g(r + 1, c + 1) - g(r - 1, c - 1) - 2 * g(r - 1, c) - g(r - 1, c + 1)
            row.append(abs(gx) + abs(gy))
        e.append(row)
    return e


def find_seam(A):
    """M[r][c] = e[r][c] + min(M[r−1][c−1..c+1])；最後一列取最小，再往上追溯"""
    e = energy(A)
    H, W = len(A), len(A[0])
    M = [row[:] for row in e]
    for r in range(1, H):
        for c in range(W):
            M[r][c] += min(M[r - 1][k] for k in (c - 1, c, c + 1) if 0 <= k < W)
    seam = [0] * H
    seam[-1] = min(range(W), key=lambda c: (M[-1][c], c))
    for r in range(H - 2, -1, -1):
        best = seam[r + 1]
        for k in (seam[r + 1] - 1, seam[r + 1] + 1):
            if 0 <= k < W and M[r][k] < M[r][best]:
                best = k
        seam[r] = best
    return seam, M[-1][seam[-1]]


for name in ["shapes", "step"]:
    A = preset(name)
    for s in range(1, 4):
        seam, cost = find_seam(A)
        ok = all(abs(seam[r] - seam[r - 1]) <= 1 for r in range(1, N))
        print(f"{name} seam {s}: cost {cost}, columns {' '.join(map(str, seam))}, connected {ok}")
        A = [row[:c] + row[c + 1:] for row, c in zip(A, seam)]
    print(f"{name}: width now {len(A[0])}, pixel sum {sum(map(sum, A))}")
