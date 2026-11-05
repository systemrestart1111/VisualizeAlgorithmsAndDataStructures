W = 8
MASK = (1 << W) - 1


def b(x):
    return format(x & MASK, f"0{W}b")


a, c, k = 182, 109, 3
print("a      =", b(a), a)
print("b      =", b(c), c)
print("a & b  =", b(a & c), a & c)
print("a | b  =", b(a | c), a | c)
print("a ^ b  =", b(a ^ c), a ^ c)
print("~a     =", b(~a), ~a & MASK)
print("a << 3 =", b(a << k), (a << k) & MASK, "(overflow bits:", (a << k) >> W, ")")
print("a >> 3 =", b(a >> k), a >> k)
print("lowbit =", b(a & -a), a & -a)
print("bit 3 of a =", (a >> k) & 1, "; set bit 3 ->", a | (1 << k), "; clear bit 2 ->", a & ~(1 << 2) & MASK)
print("-3 in 8 bits =", b(-3))
