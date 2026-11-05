def mod_inverse(a, m):
    """用擴展歐幾里得解 a·x + m·y = 1，x 就是 a 在模 m 下的反元素（需 gcd(a, m) = 1）"""
    old_r, r, old_t, t = m, a, 0, 1
    while r:
        q = old_r // r
        old_r, r = r, old_r - q * r
        old_t, t = t, old_t - q * t
    if old_r != 1:
        return None
    return old_t % m


a, m = 17, 43
inv = mod_inverse(a, m)
print(f"{a}^-1 mod {m} = {inv}")
print(f"check: {a} x {inv} mod {m} = {a * inv % m}")
print(f"Fermat (m is prime): {a}^({m}-2) mod {m} = {pow(a, m - 2, m)}")
