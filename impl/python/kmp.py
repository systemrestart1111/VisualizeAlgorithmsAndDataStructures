def prefix_function(p):
    """lps[i] = p[0..i] 最長的「相同前綴與後綴」長度（不含整個字串）"""
    lps = [0] * len(p)
    k = 0
    for i in range(1, len(p)):
        while k and p[i] != p[k]:
            k = lps[k - 1]
        if p[i] == p[k]:
            k += 1
        lps[i] = k
    return lps


def kmp(t, p):
    """失配時不回退文字指標，而是依 lps 把樣式滑到下一個可能的位置"""
    lps, matches, k = prefix_function(p), [], 0
    for i, ch in enumerate(t):
        while k and ch != p[k]:
            k = lps[k - 1]
        if ch == p[k]:
            k += 1
        if k == len(p):
            matches.append(i - k + 1)
            k = lps[k - 1]
    return lps, matches


lps, m = kmp("ABABDABACDABABCABAB", "ABABCABAB")
print("lps:", *lps)
print("matches at:", *m)
