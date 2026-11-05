import heapq


def kway_merge(lists):
    """最小堆積放 (值, 串列編號, 位置)，每次取最小者並補上同串列的下一個"""
    heap = [(l[0], i, 0) for i, l in enumerate(lists) if l]
    heapq.heapify(heap)
    out = []
    while heap:
        x, i, p = heapq.heappop(heap)
        out.append(x)
        if p + 1 < len(lists[i]):
            heapq.heappush(heap, (lists[i][p + 1], i, p + 1))
    return out


print(*kway_merge([[1, 4, 9, 12], [2, 3, 10], [], [5], [6, 7, 8, 11, 13]]))
print(" ".join(map(str, kway_merge([[], []]))) + " (empty)")
print(*kway_merge([[1, 1, 2], [1, 3]]))
