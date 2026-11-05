def ext_gcd(a, b):
    """同時維護係數：每一列都滿足 r = a·s + b·t；最後非零的 r 就是 gcd"""
    old_r, r, old_s, s, old_t, t = a, b, 1, 0, 0, 1
    print(f"{'q':>4} {'r':>5} {'s':>5} {'t':>5}")
    print(f"{'':>4} {old_r:>5} {old_s:>5} {old_t:>5}")
    while r:
        q = old_r // r
        old_r, r = r, old_r - q * r
        old_s, s = s, old_s - q * s
        old_t, t = t, old_t - q * t
        print(f"{q:>4} {old_r:>5} {old_s:>5} {old_t:>5}")
    return old_r, old_s, old_t


g, x, y = ext_gcd(240, 46)
print(f"gcd = {g}, 240 x ({x}) + 46 x ({y}) = {240 * x + 46 * y}")
