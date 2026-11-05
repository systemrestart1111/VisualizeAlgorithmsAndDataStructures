def rle_encode(s):
    """把連續重複的字元壓成「次數 + 字元」"""
    out, i = [], 0
    while i < len(s):
        j = i
        while j < len(s) and s[j] == s[i]:
            j += 1
        out.append(f"{j - i}{s[i]}")
        i = j
    return "".join(out)


def rle_decode(code):
    out, num = [], ""
    for ch in code:
        if ch.isdigit():
            num += ch
        else:
            out.append(ch * int(num))
            num = ""
    return "".join(out)


s = "WWWWWWWWWWWWBWWWWWWWWWWWWBBBWWWWWWWWWWWWWWWWWWWWWWWWBWWWWWWWWWWWWWW"
code = rle_encode(s)
print("encoded:", code)
print(f"length {len(s)} -> {len(code)}, decode ok: {rle_decode(code) == s}")
