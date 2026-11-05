def lz77_encode(s, window):
    """在前面 window 個字元的「搜尋視窗」中找最長匹配，輸出 (往回距離, 長度, 下一個字元)；匹配可延伸到尚未編碼的部分"""
    out, i = [], 0
    while i < len(s):
        best_len, best_off = 0, 0
        for off in range(1, min(window, i) + 1):
            length = 0
            while i + length < len(s) - 1 and s[i - off + length] == s[i + length]:
                length += 1
            if length > best_len:
                best_len, best_off = length, off
        out.append((best_off, best_len, s[i + best_len]))
        i += best_len + 1
    return out


def lz77_decode(tokens):
    out = []
    for off, length, ch in tokens:
        for _ in range(length):
            out.append(out[-off])
        out.append(ch)
    return "".join(out)


s = "abracadabrarray"
tokens = lz77_encode(s, 8)
print("tokens:", " ".join(f"({o},{l},{c})" for o, l, c in tokens))
print("decode ok:", lz77_decode(tokens) == s)
