def bubble(a, n=None):
    """一輪把最大值推到 n-1，再遞迴處理前 n-1 個；沒有交換就提早結束"""
    if n is None:
        n = len(a)
    if n <= 1:
        return 1
    swapped = False
    for j in range(n - 1):
        if a[j] > a[j + 1]:
            a[j], a[j + 1] = a[j + 1], a[j]
            swapped = True
    if not swapped:
        return 1
    return 1 + bubble(a, n - 1)


for arr in ([38, 27, 43, 3, 9, 82, 10, 55], [], [7], [1, 2, 3, 4]):
    calls = bubble(arr)
    print("sorted:", arr, "calls:", calls)
