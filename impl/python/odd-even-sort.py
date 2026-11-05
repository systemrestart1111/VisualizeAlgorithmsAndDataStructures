def odd_even_sort(a):
    """奇偶換位排序：交替比較 (奇, 偶) 與 (偶, 奇) 相鄰對，直到沒有交換"""
    done = False
    while not done:
        done = True
        for start in (1, 0):
            for i in range(start, len(a) - 1, 2):
                if a[i] > a[i + 1]:
                    a[i], a[i + 1] = a[i + 1], a[i]
                    done = False


a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72]
odd_even_sort(a)
print(*a)
