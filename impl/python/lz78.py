def lz78_encode(s):
    """字典從空開始：找出字典中最長的前綴 w，輸出 (w 的編號, 下一個字元)，並把 w+字元 加入字典"""
    d, out, w = {}, [], ""
    for ch in s:
        if w + ch in d:
            w += ch
        else:
            out.append((d.get(w, 0), ch))
            d[w + ch] = len(d) + 1
            w = ""
    if w:
        out.append((d[w], ""))
    return out, d


pairs, d = lz78_encode("ABBCBCABABCAABCAAB")
print("output:", " ".join(f"({i},{c})" for i, c in pairs))
print("dictionary:", " ".join(f"{v}:{k}" for k, v in d.items()))
