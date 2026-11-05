ALPHABET = "abcdefghijklmnopqrstuvwxyz"


def mtf_encode(s):
    """輸出字元目前的位置，再把它移到最前面"""
    table, out = list(ALPHABET), []
    for c in s:
        i = table.index(c)
        out.append(i)
        table.insert(0, table.pop(i))
    return out


def mtf_decode(codes):
    table, out = list(ALPHABET), []
    for i in codes:
        c = table.pop(i)
        out.append(c)
        table.insert(0, c)
    return "".join(out)


for s in ["bananaaa", "aaabbbccc", "abcabcabc", "annb"]:
    codes = mtf_encode(s)
    print(f"{s}: {' '.join(map(str, codes))} -> {mtf_decode(codes)}")
