import heapq
from bisect import bisect_left


def patience_sort(a):
    """發牌到「牌頂 ≥ x」的最左牌堆；再用最小堆積多路合併各堆牌頂"""
    piles, tops = [], []
    for x in a:
        i = bisect_left(tops, x)   # tops 由左到右遞增
        if i == len(piles):
            piles.append([x])
            tops.append(x)
        else:
            piles[i].append(x)
            tops[i] = x
    heap = [(p[-1], i) for i, p in enumerate(piles)]
    heapq.heapify(heap)
    out = []
    while heap:
        x, i = heapq.heappop(heap)
        out.append(x)
        piles[i].pop()
        if piles[i]:
            heapq.heappush(heap, (piles[i][-1], i))
    return out, len(tops)


a = [6, 3, 9, 2, 8, 3, 7, 1, 5, 4, 9]
out, k = patience_sort(a)
print("piles:", k)
print("sorted:", *out)
