def det2(K):
    return K[0][0] * K[1][1] - K[0][1] * K[1][0]


def inverse_key(K):
    """2×2 金鑰在 mod 26 的反矩陣；det 與 26 不互質時不可逆"""
    d = det2(K) % 26
    try:
        di = pow(d, -1, 26)
    except ValueError:
        return None
    a, b, c, e = K[0][0], K[0][1], K[1][0], K[1][1]
    return [[e * di % 26, -b * di % 26], [-c * di % 26, a * di % 26]]


def hill(text, K):
    t = [ord(ch) - 65 for ch in text.upper() if ch.isalpha()]
    if len(t) % 2:
        t.append(23)  # 補 X
    out = []
    for i in range(0, len(t), 2):
        p = t[i:i + 2]
        out += [(K[r][0] * p[0] + K[r][1] * p[1]) % 26 for r in range(2)]
    return "".join(chr(x + 65) for x in out)


K = [[3, 3], [2, 5]]
Ki = inverse_key(K)
c = hill("HELP ME", K)
print("K^-1 =", Ki)
print("cipher:", c)
print("plain :", hill(c, Ki))
print("key [[2,4],[6,8]] invertible:", inverse_key([[2, 4], [6, 8]]) is not None)
