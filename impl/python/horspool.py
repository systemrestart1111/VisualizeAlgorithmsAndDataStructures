def horspool(t, p):
    """只用「視窗最右端那個文字字元」決定移動量：shift[c] = 它在樣式（不含最後一字）中最後出現處到結尾的距離"""
    n, m = len(t), len(p)
    shift = {p[i]: m - 1 - i for i in range(m - 1)}
    s, tries, matches = 0, [], []
    while s <= n - m:
        tries.append(s)
        j = m - 1
        while j >= 0 and p[j] == t[s + j]:
            j -= 1
        if j < 0:
            matches.append(s)
        s += shift.get(t[s + m - 1], m)
    return matches, tries


m, tries = horspool("JIM SAW ME IN A BARBERSHOP", "BARBER")
print("alignments tried:", *tries)
print("matches at:", *m)
