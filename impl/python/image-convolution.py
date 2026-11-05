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


def at(a, r, c, mode):
    """超出範圍時依邊界模式取值：補 0、複製邊緣、鏡射"""
    if 0 <= r < N and 0 <= c < N:
        return a[r][c]
    if mode == "zero":
        return 0
    if mode == "replicate":
        return a[min(N - 1, max(0, r))][min(N - 1, max(0, c))]
    def ref(i):
        while i < 0 or i >= N:
            i = -i if i < 0 else 2 * (N - 1) - i
        return i
    return a[ref(r)][ref(c)]


def conv(a, K, mode):
    """相關運算：核心中心對準像素，對應位置相乘後加總"""
    h = len(K) // 2
    return [[sum(K[i + h][j + h] * at(a, r + i, c + j, mode) for i in range(-h, h + 1) for j in range(-h, h + 1)) for c in range(N)] for r in range(N)]


A = shapes()
KS = {"sharpen": [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], "laplace": [[0, 1, 0], [1, -4, 1], [0, 1, 0]], "emboss": [[-2, -1, 0], [-1, 1, 1], [0, 1, 2]]}
for name, K in KS.items():
    for mode in ["zero", "replicate", "reflect"]:
        out = conv(A, K, mode)
        flat = [v for row in out for v in row]
        print(f"{name}/{mode}: sum {sum(flat)}, out(0,0) = {out[0][0]}, out(5,4) = {out[5][4]}, min {min(flat)}, max {max(flat)}")
