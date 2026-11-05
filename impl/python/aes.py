def xtime(a):
    return ((a << 1) & 0xFF) ^ (0x1B if a & 0x80 else 0)


def gmul(a, b):
    p = 0
    for _ in range(8):
        if b & 1:
            p ^= a
        a, b = xtime(a), b >> 1
    return p


def make_sbox():
    """S-box：GF(2^8) 反元素後做仿射轉換"""
    s = []
    for x in range(256):
        inv = next((y for y in range(1, 256) if gmul(x, y) == 1), 0) if x else 0
        r = inv
        for k in range(1, 5):
            r ^= ((inv << k) | (inv >> (8 - k))) & 0xFF
        s.append(r ^ 0x63)
    return s


SBOX = make_sbox()
INV = [0] * 256
for i, v in enumerate(SBOX):
    INV[v] = i


def expand(key):
    w = [list(key[4 * i:4 * i + 4]) for i in range(4)]
    rc = 1
    for i in range(4, 44):
        t = list(w[i - 1])
        if i % 4 == 0:
            t = [SBOX[t[1]] ^ rc, SBOX[t[2]], SBOX[t[3]], SBOX[t[0]]]
            rc = xtime(rc)
        w.append([a ^ b for a, b in zip(t, w[i - 4])])
    return [sum(w[4 * r:4 * r + 4], []) for r in range(11)]


def mix(s, m):
    o = list(s)
    for c in range(4):
        col = s[4 * c:4 * c + 4]
        for r in range(4):
            o[4 * c + r] = gmul(col[0], m[r][0]) ^ gmul(col[1], m[r][1]) ^ gmul(col[2], m[r][2]) ^ gmul(col[3], m[r][3])
    return o


MIX = [[2, 3, 1, 1], [1, 2, 3, 1], [1, 1, 2, 3], [3, 1, 1, 2]]
INV_MIX = [[14, 11, 13, 9], [9, 14, 11, 13], [13, 9, 14, 11], [11, 13, 9, 14]]


def encrypt(block, rk):
    s = [b ^ k for b, k in zip(block, rk[0])]
    for r in range(1, 11):
        s = [SBOX[b] for b in s]                                   # SubBytes
        s = [s[i % 4 + 4 * ((i // 4 + i % 4) % 4)] for i in range(16)]  # ShiftRows（欄主序）
        if r < 10:
            s = mix(s, MIX)                                        # MixColumns
        s = [b ^ k for b, k in zip(s, rk[r])]                      # AddRoundKey
    return s


def decrypt(block, rk):
    s = [b ^ k for b, k in zip(block, rk[10])]
    for r in range(9, -1, -1):
        s = [s[i % 4 + 4 * ((i // 4 - i % 4) % 4)] for i in range(16)]
        s = [INV[b] for b in s]
        s = [b ^ k for b, k in zip(s, rk[r])]
        if r:
            s = mix(s, INV_MIX)
    return s


for key, pt in (("000102030405060708090a0b0c0d0e0f", "00112233445566778899aabbccddeeff"), ("2b7e151628aed2a6abf7158809cf4f3c", "6bc1bee22e409f96e93d7e117393172a")):
    rk = expand(bytes.fromhex(key))
    ct = encrypt(list(bytes.fromhex(pt)), rk)
    print("key  :", key)
    print("rk10 :", bytes(rk[10]).hex())
    print("ct   :", bytes(ct).hex())
    print("back :", bytes(decrypt(ct, rk)).hex())
