def cycle_sort(a):
    """每個元素直接寫到最終位置；跳過重複值避免無窮迴圈。回傳寫入次數"""
    writes = 0
    n = len(a)
    for start in range(n - 1):
        item = a[start]
        pos = start + sum(1 for i in range(start + 1, n) if a[i] < item)
        if pos == start:
            continue
        while item == a[pos]:
            pos += 1
        a[pos], item = item, a[pos]
        writes += 1
        while pos != start:
            pos = start + sum(1 for i in range(start + 1, n) if a[i] < item)
            while pos != start and item == a[pos]:
                pos += 1
            if pos == start:
                a[start] = item
                writes += 1
                break
            a[pos], item = item, a[pos]
            writes += 1
    return writes


a = [20, 40, 50, 10, 30, 40, 20, 60, 10]
w = cycle_sort(a)
print("sorted:", *a)
print("writes:", w)
b = [3, 3, 3, 1]
print("dups:", *b, "->", end=" ")
cycle_sort(b)
print(*b)
