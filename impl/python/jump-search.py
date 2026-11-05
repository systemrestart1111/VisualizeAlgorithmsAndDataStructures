import math


def jump_search(a, t):
    """a 已排序；每次跳 √n 格找到區塊，再在區塊內線性搜尋"""
    n = len(a)
    step = int(math.sqrt(n))
    prev, cur = 0, step
    while cur < n and a[cur - 1] < t:
        prev, cur = cur, cur + step
    for i in range(prev, min(cur, n)):
        if a[i] == t:
            return i
    return -1


a = [1, 4, 7, 10, 14, 18, 21, 25, 29, 33, 38, 42, 47, 51, 56, 60]
print("search 47 ->", jump_search(a, 47))
print("search 30 ->", jump_search(a, 30))
