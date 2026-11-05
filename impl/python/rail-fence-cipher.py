def pattern(n, rails):
    """每個位置所在的軌道（鋸齒路徑）"""
    rows, r, d = [], 0, 1
    for _ in range(n):
        rows.append(r)
        if rails > 1:
            if r == 0:
                d = 1
            elif r == rails - 1:
                d = -1
            r += d
    return rows


def encrypt(text, rails):
    rows = pattern(len(text), rails)
    order = sorted(range(len(text)), key=lambda i: (rows[i], i))
    return "".join(text[i] for i in order)


def decrypt(cipher, rails):
    rows = pattern(len(cipher), rails)
    order = sorted(range(len(cipher)), key=lambda i: (rows[i], i))
    out = [""] * len(cipher)
    for k, pos in enumerate(order):
        out[pos] = cipher[k]
    return "".join(out)


c = encrypt("WEAREDISCOVERED", 3)
print("cipher:", c)
print("plain :", decrypt(c, 3))
print("1 rail:", encrypt("HELLO", 1))
print("short :", encrypt("AB", 5), decrypt(encrypt("AB", 5), 5))
