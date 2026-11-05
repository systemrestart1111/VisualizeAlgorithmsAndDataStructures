from math import gcd, isqrt


def bsgs(a, b, M):
    """a^x ≡ b (mod M)：小步存 a^j，大步檢查 b·a^(−s·i)；需要 gcd(a, M) = 1"""
    if gcd(a % M, M) != 1:
        return "gcd != 1"
    a, b = a % M, b % M
    s = isqrt(M - 1) + 1
    table, cur = {}, 1
    for j in range(s):
        table.setdefault(cur, j)
        cur = cur * a % M
    factor = pow(pow(a, s, M), -1, M)
    gamma = b
    for i in range(s):
        if gamma in table:
            return i * s + table[gamma]
        gamma = gamma * factor % M
    return None


for a, b, M in [(3, 13, 101), (2, 3, 7), (5, 1, 23), (2, 1000, 1000003), (7, 123456, 1000000007), (6, 4, 10), (3, 13, 17)]:
    x = bsgs(a, b, M)
    if x == "gcd != 1":
        print(f"{a}^x = {b} mod {M}: gcd(a, M) != 1, basic BSGS not applicable")
    elif x is None:
        print(f"{a}^x = {b} mod {M}: no solution")
    else:
        print(f"{a}^x = {b} mod {M}: x = {x} (check {pow(a, x, M)})")
