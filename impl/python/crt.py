def mod_inverse(a, m):
    old_r, r, old_t, t = m, a % m, 0, 1
    while r:
        q = old_r // r
        old_r, r = r, old_r - q * r
        old_t, t = t, old_t - q * t
    return old_t % m


EQS = [(2, 3), (3, 5), (2, 7)]  # x ≡ a (mod m)，模數兩兩互質

# x = Σ a_i · M_i · (M_i⁻¹ mod m_i)，其中 M_i = M / m_i；每一項只在自己的模數下不為 0
M = 1
for _, m in EQS:
    M *= m
x = 0
for a, m in EQS:
    Mi = M // m
    inv = mod_inverse(Mi, m)
    print(f"a={a}, m={m}: M_i = {Mi}, M_i^-1 mod {m} = {inv}, term = {a * Mi * inv}")
    x += a * Mi * inv
print(f"x = {x % M} (mod {M})")
