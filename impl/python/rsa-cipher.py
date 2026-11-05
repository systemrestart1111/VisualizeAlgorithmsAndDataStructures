def egcd_inverse(e, phi):
    """擴展歐幾里得求 e 在 mod φ 的反元素"""
    r0, r1, s0, s1 = e, phi, 1, 0
    while r1:
        q = r0 // r1
        r0, r1 = r1, r0 - q * r1
        s0, s1 = s1, s0 - q * s1
    if r0 != 1:
        raise ValueError("gcd(e, φ) ≠ 1")
    return s0 % phi


def mod_pow(b, e, m):
    """平方乘法：由高位到低位"""
    r = 1
    for bit in bin(e)[2:]:
        r = r * r % m
        if bit == "1":
            r = r * b % m
    return r


p, q, e = 61, 53, 17
n, phi = p * q, (p - 1) * (q - 1)
d = egcd_inverse(e, phi)
print(f"n = {n}, phi = {phi}, e = {e}, d = {d}")
msgs = [65, 66, 67]
cs = [mod_pow(m, e, n) for m in msgs]
print("cipher:", cs)
print("plain :", [mod_pow(c, d, n) for c in cs])
