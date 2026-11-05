import math


def mo(a, queries):
    """查詢依 (l 所在塊, r) 排序，左右指標逐格移動並維護相異數"""
    B = max(1, math.ceil(math.sqrt(len(a))))
    order = sorted(range(len(queries)), key=lambda i: (queries[i][0] // B, queries[i][1], i))
    cnt, distinct, moves = {}, 0, 0
    L, R = 0, -1
    ans = [0] * len(queries)

    def add(x):
        nonlocal distinct, moves
        cnt[x] = cnt.get(x, 0) + 1
        distinct += cnt[x] == 1
        moves += 1

    def remove(x):
        nonlocal distinct, moves
        cnt[x] -= 1
        distinct -= cnt[x] == 0
        moves += 1

    for i in order:
        l, r = queries[i]
        while R < r:
            R += 1
            add(a[R])
        while L > l:
            L -= 1
            add(a[L])
        while R > r:
            remove(a[R])
            R -= 1
        while L < l:
            remove(a[L])
            L += 1
        ans[i] = distinct
    return ans, moves


a = [1, 2, 1, 3, 2, 2, 4, 1, 5, 3, 4, 4]
qs = [(0, 4), (2, 7), (5, 11), (1, 3), (6, 9), (0, 11)]
ans, moves = mo(a, qs)
for (l, r), x in zip(qs, ans):
    print(f"distinct[{l}, {r}] = {x} (brute {len(set(a[l:r + 1]))})")
print("pointer moves:", moves)
