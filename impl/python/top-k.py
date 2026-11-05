import heapq


def top_k(a, k):
    """維持大小為 k 的最小堆積：比堆頂大的元素才換進來，最後堆內就是最大的 k 個"""
    heap = []
    for x in a:
        if len(heap) < k:
            heapq.heappush(heap, x)
        elif x > heap[0]:
            heapq.heapreplace(heap, x)
    return sorted(heap, reverse=True)


a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47]
print("top 4:", *top_k(a, 4))
