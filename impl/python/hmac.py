import hashlib

KNOWN = ["f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8", "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843"]


def hmac_sha256(key: bytes, msg: bytes) -> bytes:
    """H((K0 ⊕ opad) ∥ H((K0 ⊕ ipad) ∥ m))"""
    if len(key) > 64:
        key = hashlib.sha256(key).digest()
    k0 = key.ljust(64, b"\x00")
    inner = hashlib.sha256(bytes(b ^ 0x36 for b in k0) + msg).digest()
    return hashlib.sha256(bytes(b ^ 0x5C for b in k0) + inner).digest()


def same(a: bytes, b: bytes) -> bool:
    """固定時間比較：不因第一個不同的位元組提早結束"""
    diff = len(a) ^ len(b)
    for x, y in zip(a, b):
        diff |= x ^ y
    return diff == 0


tests = [(b"key", b"The quick brown fox jumps over the lazy dog"), (b"Jefe", b"what do ya want for nothing?")]
for (k, m), want in zip(tests, KNOWN):
    mac = hmac_sha256(k, m)
    print(mac.hex(), "known vector:", mac.hex() == want)
print("long key:", hmac_sha256(b"k" * 100, b"long key is hashed first").hex())
mac = hmac_sha256(b"key", b"transfer 100 to bob")
print("verify original:", same(mac, hmac_sha256(b"key", b"transfer 100 to bob")))
print("verify tampered:", same(mac, hmac_sha256(b"key", b"transfer 900 to bob")))
print("verify wrong key:", same(mac, hmac_sha256(b"kex", b"transfer 100 to bob")))
