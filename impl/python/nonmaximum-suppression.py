import math

N = 16
BUMPS = [(3, 3, 100), (3, 6, 100), (10, 4, 80), (8, 12, 120), (13, 13, 60)]


def score_map():
    a = [[math.floor(sum(A * math.exp(-((r - br) ** 2 + (c - bc) ** 2) / 3) for br, bc, A in BUMPS) + 0.5) for c in range(N)] for r in range(N)]
    for r, c in [(12, 7), (12, 8), (13, 7), (13, 8)]:
        a[r][c] = 70
    return a


def nms(S, rad, thr):
    """不小於視窗內所有鄰居才保留；相等時只留光柵順序最早的"""
    kept = []
    for i in range(N):
        for j in range(N):
            if S[i][j] < thr:
                continue
            ok = True
            for a in range(-rad, rad + 1):
                for b in range(-rad, rad + 1):
                    y, x = i + a, j + b
                    if (a or b) and 0 <= y < N and 0 <= x < N:
                        if S[y][x] > S[i][j] or (S[y][x] == S[i][j] and (a < 0 or (a == 0 and b < 0))):
                            ok = False
            if ok:
                kept.append((i, j))
    return kept


S = score_map()
for rad, thr in [(1, 30), (2, 30), (1, 80)]:
    kept = nms(S, rad, thr)
    print(f"window {2 * rad + 1}x{2 * rad + 1}, threshold {thr}: {len(kept)} kept: " + " ".join(f"({i},{j})={S[i][j]}" for i, j in kept))
