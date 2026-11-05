def bwt(s):
    """加上終止符 $，排序所有循環旋轉，取最後一欄"""
    s += "$"
    rots = sorted(s[i:] + s[:i] for i in range(len(s)))
    return "".join(r[-1] for r in rots)


def inverse(L):
    """LF 映射：L 中第 k 個 c 對應 F 中第 k 個 c；從 $ 所在列往回讀"""
    F = sorted(L)
    first = {}
    for i, c in enumerate(F):
        first.setdefault(c, i)
    seen, LF = {}, []
    for c in L:
        LF.append(first[c] + seen.get(c, 0))
        seen[c] = seen.get(c, 0) + 1
    row, out = L.index("$"), []
    for _ in range(len(L) - 1):
        row = LF[row]
        out.append(L[row])
    return "".join(reversed(out))


for s in ["banana", "abracadabra", "mississippi", "aaaa"]:
    L = bwt(s)
    print(f"{s}: bwt {L}, inverse {inverse(L)}")
