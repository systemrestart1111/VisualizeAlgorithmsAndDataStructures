def vigenere(text, key, decrypt=False):
    """關鍵字字母決定位移；非字母原樣輸出且不消耗關鍵字位置"""
    key = [ord(c) - 65 for c in key.upper() if c.isalpha()]
    out, j = [], 0
    for ch in text:
        if not ("A" <= ch <= "Z" or "a" <= ch <= "z"):
            out.append(ch)
            continue
        k = -key[j % len(key)] if decrypt else key[j % len(key)]
        base = 65 if ch <= "Z" else 97
        out.append(chr((ord(ch) - base + k) % 26 + base))
        j += 1
    return "".join(out)


c = vigenere("ATTACK AT DAWN!", "LEMON")
print("cipher:", c)
print("plain :", vigenere(c, "LEMON", True))
print("mixed :", vigenere("Hello, World", "key"))
