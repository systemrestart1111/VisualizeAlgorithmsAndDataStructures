def next_permutation(a):
    """找轉折點 i、從右邊找比 a[i] 大的最右元素交換，再反轉尾段；已是最大排列時回到最小"""
    i = len(a) - 2
    while i >= 0 and a[i] >= a[i + 1]:
        i -= 1
    if i >= 0:
        j = len(a) - 1
        while a[j] <= a[i]:
            j -= 1
        a[i], a[j] = a[j], a[i]
    a[i + 1:] = reversed(a[i + 1:])
    return a


a = [1, 3, 5, 4, 2]
for _ in range(3):
    print(*next_permutation(a))
print("wrap:", *next_permutation([3, 2, 1]))
dup = [1, 1, 2]
for _ in range(3):
    print("dup:", *next_permutation(dup))
