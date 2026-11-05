def square(key):
    """關鍵字（J 視為 I，去重複）接上其餘字母，排成 5×5"""
    seen = []
    for ch in (key.upper() + "ABCDEFGHIKLMNOPQRSTUVWXYZ").replace("J", "I"):
        if ch.isalpha() and ch not in seen:
            seen.append(ch)
    return seen


def pairs_of(text):
    """相同字母中間插 X（XX 則插 Q），奇數長度補 X（末字為 X 則補 Q）"""
    t = "".join(c for c in text.upper() if c.isalpha()).replace("J", "I")
    out, i = [], 0
    while i < len(t):
        a = t[i]
        b = t[i + 1] if i + 1 < len(t) else None
        if b is None or a == b:
            b = "Q" if a == "X" else "X"
            i += 1
        else:
            i += 2
        out.append((a, b))
    return out


def playfair(pairs, sq, d):
    pos = {ch: divmod(i, 5) for i, ch in enumerate(sq)}
    res = []
    for a, b in pairs:
        (ra, ca), (rb, cb) = pos[a], pos[b]
        if ra == rb:
            res.append(sq[ra * 5 + (ca + d) % 5] + sq[rb * 5 + (cb + d) % 5])
        elif ca == cb:
            res.append(sq[(ra + d) % 5 * 5 + ca] + sq[(rb + d) % 5 * 5 + cb])
        else:
            res.append(sq[ra * 5 + cb] + sq[rb * 5 + ca])
    return res


sq = square("PLAYFAIR EXAMPLE")
for r in range(5):
    print(" ".join(sq[r * 5:r * 5 + 5]))
c = playfair(pairs_of("HIDE THE GOLD IN THE TREE STUMP"), sq, 1)
print("cipher:", " ".join(c))
p = playfair([(x[0], x[1]) for x in c], sq, 4)
print("plain :", " ".join(p))
