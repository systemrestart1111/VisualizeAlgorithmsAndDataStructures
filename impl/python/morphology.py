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


def morph(a, se, erode):
    """侵蝕：蓋到的全為 1 才為 1；膨脹：蓋到任一為 1 就為 1；邊界外視為 0"""
    get = lambda r, c: a[r][c] if 0 <= r < N and 0 <= c < N else 0
    f = all if erode else any
    return [[1 if f(get(r + dr, c + dc) for dr, dc in se) else 0 for c in range(N)] for r in range(N)]


def components(a):
    seen, n = [[0] * N for _ in range(N)], 0
    for r in range(N):
        for c in range(N):
            if a[r][c] and not seen[r][c]:
                n += 1
                st = [(r, c)]
                seen[r][c] = 1
                while st:
                    y, x = st.pop()
                    for dy, dx in N4:
                        if 0 <= y + dy < N and 0 <= x + dx < N and a[y + dy][x + dx] and not seen[y + dy][x + dx]:
                            seen[y + dy][x + dx] = 1
                            st.append((y + dy, x + dx))
    return n


count = lambda a: sum(map(sum, a))
for name, A in [("noisy blobs", noisy_bin()), ("blobs", blobs())]:
    for sname, se in [("square", [(0, 0)] + N8), ("cross", [(0, 0)] + N4)]:
        er, di = morph(A, se, True), morph(A, se, False)
        op, cl = morph(er, se, False), morph(di, se, True)
        print(f"{name}, {sname}: input {count(A)} ({components(A)} parts), erode {count(er)}, dilate {count(di)}, open {count(op)} ({components(op)} parts), close {count(cl)} ({components(cl)} parts)")
