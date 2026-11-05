# 以自行實作的 AES-128 區塊加密為基礎（同 aes.py）
def xtime(a):
    return ((a << 1) & 0xFF) ^ (0x1B if a & 0x80 else 0)


def gmul(a, b):
    p = 0
    for _ in range(8):
        if b & 1:
            p ^= a
        a, b = xtime(a), b >> 1
    return p


SBOX = []
for x in range(256):
    inv = next((y for y in range(1, 256) if gmul(x, y) == 1), 0) if x else 0
    r = inv
    for k in range(1, 5):
        r ^= ((inv << k) | (inv >> (8 - k))) & 0xFF
    SBOX.append(r ^ 0x63)
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
    return [gmul(s[4 * (i // 4)], m[i % 4][0]) ^ gmul(s[4 * (i // 4) + 1], m[i % 4][1]) ^ gmul(s[4 * (i // 4) + 2], m[i % 4][2]) ^ gmul(s[4 * (i // 4) + 3], m[i % 4][3]) for i in range(16)]


def enc(block, rk):
    s = [b ^ k for b, k in zip(block, rk[0])]
    for r in range(1, 11):
        s = [SBOX[b] for b in s]
        s = [s[i % 4 + 4 * ((i // 4 + i % 4) % 4)] for i in range(16)]
        if r < 10:
            s = mix(s, [[2, 3, 1, 1], [1, 2, 3, 1], [1, 1, 2, 3], [3, 1, 1, 2]])
        s = [b ^ k for b, k in zip(s, rk[r])]
    return s


def dec(block, rk):
    s = [b ^ k for b, k in zip(block, rk[10])]
    for r in range(9, -1, -1):
        s = [s[i % 4 + 4 * ((i // 4 - i % 4) % 4)] for i in range(16)]
        s = [INV[b] ^ k for b, k in zip(s, rk[r])]
        if r:
            s = mix(s, [[14, 11, 13, 9], [9, 14, 11, 13], [13, 9, 14, 11], [11, 13, 9, 14]])
    return s


def cbc_encrypt(pt, rk, iv, pad=True):
    """PKCS#7 填充後，每塊先與前一個密文區塊 XOR 再加密"""
    if pad:
        n = 16 - len(pt) % 16
        pt = pt + bytes([n]) * n
    prev, out = list(iv), []
    for i in range(0, len(pt), 16):
        prev = enc([a ^ b for a, b in zip(pt[i:i + 16], prev)], rk)
        out += prev
    return bytes(out)


def cbc_decrypt(ct, rk, iv):
    prev, out = list(iv), []
    for i in range(0, len(ct), 16):
        blk = list(ct[i:i + 16])
        out += [a ^ b for a, b in zip(dec(blk, rk), prev)]
        prev = blk
    n = out[-1]
    assert 1 <= n <= 16 and out[-n:] == [n] * n, "填充錯誤"
    return bytes(out[:-n])


def ctr(data, rk, nonce):
    """金鑰流 = AES(nonce ∥ 計數器)，與資料 XOR；加解密相同，不需填充"""
    out = []
    for i in range(0, len(data), 16):
        ks = enc(list(nonce[:8]) + list((i // 16).to_bytes(8, "big")), rk)
        out += [a ^ b for a, b in zip(data[i:i + 16], ks)]
    return bytes(out)


key = bytes.fromhex("2b7e151628aed2a6abf7158809cf4f3c")
iv = bytes.fromhex("000102030405060708090a0b0c0d0e0f")
rk = expand(key)
print("CBC SP800-38A:", cbc_encrypt(bytes.fromhex("6bc1bee22e409f96e93d7e117393172a"), rk, iv, pad=False).hex())
pt = b"Block modes chain AES blocks!"
c = cbc_encrypt(pt, rk, iv)
print("CBC:", c.hex())
print("CBC back:", cbc_decrypt(c, rk, iv).decode())
c = ctr(pt, rk, iv)
print("CTR:", c.hex())
print("CTR back:", ctr(c, rk, iv).decode())
