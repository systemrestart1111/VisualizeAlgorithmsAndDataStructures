def lzw_encode(s):
    """字典預先放入所有單一字元（0..255）；持續延長 w，遇到不在字典裡的 w+c 就輸出 w 的編號並把 w+c 加入字典"""
    d = {chr(i): i for i in range(256)}
    out, w = [], ""
    for ch in s:
        if w + ch in d:
            w += ch
        else:
            out.append(d[w])
            d[w + ch] = len(d)
            w = ch
    if w:
        out.append(d[w])
    return out, d


def lzw_decode(codes):
    d = {i: chr(i) for i in range(256)}
    w = d[codes[0]]
    out = [w]
    for c in codes[1:]:
        entry = d[c] if c in d else w + w[0]  # 特殊情況：編號剛好是正要建立的那一個
        out.append(entry)
        d[len(d)] = w + entry[0]
        w = entry
    return "".join(out)


s = "TOBEORNOTTOBEORTOBEORNOT"
codes, d = lzw_encode(s)
print("codes:", *codes)
print("new entries:", " ".join(f"{v}:{k}" for k, v in d.items() if v >= 256))
print(f"{len(s)} chars -> {len(codes)} codes, decode ok: {lzw_decode(codes) == s}")
