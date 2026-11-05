def gnome_sort(a):
    """像侏儒整理花盆：順序正確就前進，否則交換並後退一步"""
    i = 0
    while i < len(a):
        if i == 0 or a[i - 1] <= a[i]:
            i += 1
        else:
            a[i - 1], a[i] = a[i], a[i - 1]
            i -= 1


a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72]
gnome_sort(a)
print(*a)
