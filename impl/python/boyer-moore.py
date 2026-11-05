def good_suffix_table(p):
    """好後綴規則：已比對成功的後綴，在樣式中前一次出現的位置（或與前綴重疊的部分）決定可安全移動的距離"""
    m = len(p)
    shift, border = [0] * (m + 1), [0] * (m + 1)
    i, j = m, m + 1
    border[i] = j
    while i > 0:
        while j <= m and p[i - 1] != p[j - 1]:
            if shift[j] == 0:
                shift[j] = j - i
            j = border[j]
        i, j = i - 1, j - 1
        border[i] = j
    j = border[0]
    for i in range(m + 1):
        if shift[i] == 0:
            shift[i] = j
        if i == j:
            j = border[j]
    return shift


def boyer_moore(t, p):
    """由右往左比較；失配時取「壞字元規則」與「好後綴規則」中移得較遠的那個"""
    n, m = len(t), len(p)
    last = {ch: i for i, ch in enumerate(p)}  # 壞字元：該字元在樣式中最後出現的位置
    gs = good_suffix_table(p)
    s, tries, matches = 0, [], []
    while s <= n - m:
        tries.append(s)
        j = m - 1
        while j >= 0 and p[j] == t[s + j]:
            j -= 1
        if j < 0:
            matches.append(s)
            s += gs[0]
        else:
            s += max(gs[j + 1], j - last.get(t[s + j], -1))
    return matches, tries


m, tries = boyer_moore("HERE IS A SIMPLE EXAMPLE", "EXAMPLE")
print("alignments tried:", *tries)
print("matches at:", *m)
