def three_way_partition(a, p):
    """荷蘭國旗：lt 左邊 < p，gt 右邊 > p，中間 = p；一次掃描完成"""
    lt, i, gt = 0, 0, len(a) - 1
    while i <= gt:
        if a[i] < p:
            a[lt], a[i] = a[i], a[lt]
            lt += 1
            i += 1
        elif a[i] > p:
            a[i], a[gt] = a[gt], a[i]
            gt -= 1
        else:
            i += 1
    return lt, gt


a = [2, 0, 1, 2, 1, 0, 0, 2, 1, 1, 0, 2, 1, 0]
lt, gt = three_way_partition(a, 1)
print(*a)
print(f"< p: [0, {lt}), = p: [{lt}, {gt}], > p: ({gt}, {len(a)})")
