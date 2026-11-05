def col_order(key):
    """依（字母, 欄號）穩定排序，重複字母保持出現順序"""
    return sorted(range(len(key)), key=lambda c: (key[c], c))


def encrypt(text, key):
    t = "".join(ch for ch in text.upper() if ch.isalpha())
    w = len(key)
    t += "X" * (-len(t) % w)
    rows = [t[i:i + w] for i in range(0, len(t), w)]
    return "".join("".join(r[c] for r in rows) for c in col_order(key))


def decrypt(cipher, key):
    w, rows = len(key), len(cipher) // len(key)
    grid = [[""] * w for _ in range(rows)]
    k = 0
    for c in col_order(key):
        for r in range(rows):
            grid[r][c] = cipher[k]
            k += 1
    return "".join("".join(r) for r in grid)


c = encrypt("WE ARE DISCOVERED FLEE AT ONCE", "ZEBRAS")
print("cipher:", c)
print("plain :", decrypt(c, "ZEBRAS"))
print("dup key:", encrypt("HELLOWORLD", "BANANA"))
