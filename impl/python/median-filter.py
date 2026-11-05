N = 16


def shapes():
    a = [[30] * N for _ in range(N)]
    for r in range(N):
        for c in range(N):
            if 2 <= r <= 6 and 2 <= c <= 7:
                a[r][c] = 200
            if (r - 10.5) ** 2 + (c - 10.5) ** 2 <= 12.96:
                a[r][c] = 140
            if 9 <= r <= 14 and 1 <= c <= r - 8:
                a[r][c] = 90
    return a


def noisy():
    a, s = shapes(), 7
    for r in range(N):
        for c in range(N):
            s = s * 48271 % 2147483647
            t = s % 100
            a[r][c] = 0 if t < 5 else 255 if t < 10 else a[r][c]
    return a


def window(a, r, c, rad):
    return [a[min(N - 1, max(0, r + i))][min(N - 1, max(0, c + j))] for i in range(-rad, rad + 1) for j in range(-rad, rad + 1)]


def median(a, rad):
    """每個像素換成視窗內的中位數（邊界複製）"""
    return [[sorted(window(a, r, c, rad))[(2 * rad + 1) ** 2 // 2] for c in range(N)] for r in range(N)]


def mean(a, rad):
    return [[sum(window(a, r, c, rad)) / (2 * rad + 1) ** 2 for c in range(N)] for r in range(N)]


clean, A = shapes(), noisy()
noise = lambda a: sum(1 for row in a for v in row if v in (0, 255))
bad = lambda a: sum(1 for r in range(N) for c in range(N) if abs(a[r][c] - clean[r][c]) > 40)
print(f"input: {noise(A)} impulse pixels, {bad(A)} pixels off by > 40")
for rad in [1, 2]:
    m, avg = median(A, rad), mean(A, rad)
    print(f"{2 * rad + 1}x{2 * rad + 1}: median leaves {noise(m)} impulses, {bad(m)} off by > 40 (sum {sum(map(sum, m))}); mean filter {bad(avg)} off by > 40")
