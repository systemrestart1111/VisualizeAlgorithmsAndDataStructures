def caesar(text, k):
    """每個字母位移 k 格（mod 26），保留大小寫，非字母原樣輸出"""
    out = []
    for ch in text:
        if "A" <= ch <= "Z" or "a" <= ch <= "z":
            base = ord("A") if ch <= "Z" else ord("a")
            out.append(chr((ord(ch) - base + k) % 26 + base))
        else:
            out.append(ch)
    return "".join(out)


msg = "Hello, World! XYZ"
c = caesar(msg, 3)
print("encrypt k=3:", c)
print("decrypt   :", caesar(c, -3))
for k in (0, 25, 26):
    print(f"k={k}:", caesar(msg, k))
