from collections import deque

N4 = [(-1, 0), (0, -1), (0, 1), (1, 0)]
N8 = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def grid():
    """外框（色 2）左上角缺一格，內部只能斜著碰到外面"""
    a = [[1] * 12 for _ in range(12)]
    for i in range(2, 10):
        for j in range(2, 10):
            if i in (2, 9) or j in (2, 9):
                a[i][j] = 2
    a[2][2] = 1
    for i in (5, 6):
        for j in (5, 6):
            a[i][j] = 3
    return a


def flood(a, sr, sc, new, nb):
    """BFS 把與種子相連、顏色相同的格子塗成新顏色；新舊色相同時直接結束"""
    old = a[sr][sc]
    if old == new:
        return 0
    a[sr][sc] = new
    q, count = deque([(sr, sc)]), 1
    while q:
        r, c = q.popleft()
        for dr, dc in nb:
            y, x = r + dr, c + dc
            if 0 <= y < 12 and 0 <= x < 12 and a[y][x] == old:
                a[y][x] = new
                count += 1
                q.append((y, x))
    return count


for sr, sc, new, conn in [(4, 4, 4, 4), (4, 4, 4, 8), (0, 0, 5, 4), (5, 5, 3, 4), (5, 5, 1, 8), (2, 5, 4, 4)]:
    a = grid()
    n = flood(a, sr, sc, new, N4 if conn == 4 else N8)
    print(f"seed ({sr},{sc}) -> color {new}, {conn}-connected: {n} cells filled" + (" (same color, nothing to do)" if n == 0 else "") + f", grid sum {sum(map(sum, a))}")
