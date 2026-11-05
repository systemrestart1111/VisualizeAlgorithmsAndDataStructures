def gf_mul(a, b):
    """GF(2^8) 乘法：逐位相加（XOR），a 每次乘 x（xtime），溢出時對 0x11B 約化"""
    p = 0
    for _ in range(8):
        if b & 1:
            p ^= a
        hi = a & 0x80
        a = (a << 1) & 0xFF
        if hi:
            a ^= 0x1B
        b >>= 1
    return p


def gf_inv(a):
    """a^254 = a^-1（a ≠ 0）"""
    if a == 0:
        return None
    r, e = 1, 254
    while e:
        if e & 1:
            r = gf_mul(r, a)
        a = gf_mul(a, a)
        e >>= 1
    return r


print(f"0x57 + 0x83 = 0x{0x57 ^ 0x83:02X}")
print(f"0x57 * 0x83 = 0x{gf_mul(0x57, 0x83):02X}")
print(f"0x57 * 0x13 = 0x{gf_mul(0x57, 0x13):02X}")
inv = gf_inv(0x57)
print(f"inv(0x57) = 0x{inv:02X}, check = 0x{gf_mul(0x57, inv):02X}")
print("inv(0x00) =", gf_inv(0) if gf_inv(0) is not None else "none")
