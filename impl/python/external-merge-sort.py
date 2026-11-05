import heapq


def external_sort(data, m):
    """記憶體只能放 m 筆：先切成長度 m 的有序 run，再用最小堆積做 k 路合併"""
    runs = [sorted(data[i:i + m]) for i in range(0, len(data), m)]
    for i, r in enumerate(runs):
        print(f"run {i}:", *r)
    heap = [(r[0], i, 0) for i, r in enumerate(runs)]
    heapq.heapify(heap)
    out = []
    while heap:
        v, i, j = heapq.heappop(heap)
        out.append(v)
        if j + 1 < len(runs[i]):
            heapq.heappush(heap, (runs[i][j + 1], i, j + 1))
    return out


data = [41, 7, 63, 22, 88, 15, 34, 70, 2, 56, 29, 93, 11, 47, 80, 38, 5, 66]
print("merged:", *external_sort(data, 4))
