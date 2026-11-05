def merge_sort(a):
    """分成左右兩半各自排序，再把兩個有序序列合併"""
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            out.append(left[i]); i += 1
        else:
            out.append(right[j]); j += 1
    return out + left[i:] + right[j:]


a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47]
print(*merge_sort(a))
