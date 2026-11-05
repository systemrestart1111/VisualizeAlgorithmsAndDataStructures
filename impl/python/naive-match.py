def naive_match(t, p):
    """每個起點都從頭逐字比較；不相符就把樣式右移一格"""
    matches, comparisons = [], 0
    for s in range(len(t) - len(p) + 1):
        j = 0
        while j < len(p):
            comparisons += 1
            if t[s + j] != p[j]:
                break
            j += 1
        if j == len(p):
            matches.append(s)
    return matches, comparisons


m, c = naive_match("AABAACAADAABAABA", "AABA")
print("matches at:", *m)
print("comparisons =", c)
