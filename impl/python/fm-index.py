def build(text):
    """後綴陣列、BWT、C 表與 Occ 前綴計數"""
    t = text + "$"
    sa = sorted(range(len(t)), key=lambda i: t[i:])
    L = [t[i - 1] for i in sa]
    alpha = sorted(set(t))
    C, acc = {}, 0
    for c in alpha:
        C[c] = acc
        acc += t.count(c)
    occ = {c: [0] for c in alpha}
    for ch in L:
        for c in alpha:
            occ[c].append(occ[c][-1] + (ch == c))
    return sa, C, occ, len(t)


def search(index, pat):
    """向後搜尋：每讀一個字元，sp = C[c] + Occ(c, sp)、ep = C[c] + Occ(c, ep)"""
    sa, C, occ, n = index
    sp, ep = 0, n
    for c in reversed(pat):
        if c not in C:
            return []
        sp, ep = C[c] + occ[c][sp], C[c] + occ[c][ep]
        if sp >= ep:
            return []
    return sorted(sa[sp:ep])


text = "abracadabra"
idx = build(text)
for p in ["a", "abra", "cad", "ra", "xyz", "abracadabra"]:
    pos = search(idx, p)
    brute = [i for i in range(len(text) - len(p) + 1) if text[i:i + len(p)] == p]
    print(f"'{p}': {len(pos)} at {pos} (brute {brute})")
