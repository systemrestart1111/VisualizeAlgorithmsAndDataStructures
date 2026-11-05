def count(a):
    """合併排序：右邊元素先被取出時，左半剩下的都比它大；相等先取左邊（不算逆序）"""
    if len(a) <= 1:
        return a, 0
    m = len(a) // 2
    left, x = count(a[:m])
    right, y = count(a[m:])
    out, i, j, c = [], 0, 0, x + y
    while i < len(left) or j < len(right):
        if j == len(right) or (i < len(left) and left[i] <= right[j]):
            out.append(left[i])
            i += 1
        else:
            c += len(left) - i
            out.append(right[j])
            j += 1
    return out, c


for a in ([8, 4, 2, 1, 7, 3, 5, 3], [1, 2, 3], [3, 3, 3], [5, 4, 3, 2, 1]):
    brute = sum(1 for i in range(len(a)) for j in range(i + 1, len(a)) if a[i] > a[j])
    print(a, "inversions:", count(a)[1], "brute:", brute)
