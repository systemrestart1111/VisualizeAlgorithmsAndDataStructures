from math import gcd


def affine(text, a, b, decrypt=False):
    """E(x) = (a·x + b) mod 26；D(y) = a⁻¹·(y − b) mod 26；a 必須與 26 互質"""
    if gcd(a, 26) != 1:
        raise ValueError(f"a = {a} 與 26 不互質，無法解密")
    ai = pow(a, -1, 26)
    out = []
    for ch in text:
        if ch.isalpha():
            base = 65 if ch.isupper() else 97
            x = ord(ch) - base
            y = ai * (x - b) % 26 if decrypt else (a * x + b) % 26
            out.append(chr(y + base))
        else:
            out.append(ch)
    return "".join(out)


c = affine("AFFINE CIPHER", 5, 8)
print("cipher:", c)
print("plain :", affine(c, 5, 8, True))
try:
    affine("TEST", 13, 1)
except ValueError:
    print("a=13 rejected")
