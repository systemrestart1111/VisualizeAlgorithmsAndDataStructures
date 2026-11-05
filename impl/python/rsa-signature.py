import hashlib

# 教學用 512 位元金鑰（實務至少 2048 位元）
N = int("a65f7b022bd33ee0c5644be19caed71c0e691cc10d8a6f57576deda07e66082f64fe2af43a24e28ccbf95a14c9494a5182f48935586db21639efb855e79237fb", 16)
D = int("5cadfbbc2de5b3b54ac0a074c1efb3ecf12a24d6765093cdb7ea88e14b0853ae0cf5f81b24b065ad8f8f4ab699525cc9f1d1bda8ed9d743d33bd50f22191bc61", 16)
N_OTHER = int("b0d12b4fc3f44629d53fa2ea439095d3efee1a84c32ce57e0a9c921f42c935e9473b1c9f37efbe3b3e8ca504b8536e9123de2d6a38b71ee7092fb5cfb91af663", 16)
E = 65537
EM_BITS, EM_LEN, H_LEN, S_LEN = 511, 64, 32, 16
PS_LEN = EM_LEN - S_LEN - H_LEN - 2


def sha(b):
    return hashlib.sha256(b).digest()


def mgf1(seed, n):
    out, c = b"", 0
    while len(out) < n:
        out += sha(seed + c.to_bytes(4, "big"))
        c += 1
    return out[:n]


def pss_encode(msg, salt):
    """EM = (DB ⊕ MGF1(H)) ∥ H ∥ 0xbc，其中 H = SHA256(0^8 ∥ SHA256(M) ∥ salt)"""
    h = sha(b"\x00" * 8 + sha(msg) + salt)
    db = b"\x00" * PS_LEN + b"\x01" + salt
    masked = bytearray(a ^ b for a, b in zip(db, mgf1(h, EM_LEN - H_LEN - 1)))
    masked[0] &= 0xFF >> (8 * EM_LEN - EM_BITS)
    return bytes(masked) + h + b"\xbc"


def verify(msg, s, n):
    if s >= n:
        return False
    em = pow(s, E, n).to_bytes(EM_LEN, "big")
    if em[-1] != 0xBC:
        return False
    masked, h = em[:EM_LEN - H_LEN - 1], em[EM_LEN - H_LEN - 1:-1]
    if masked[0] & ~(0xFF >> (8 * EM_LEN - EM_BITS)) & 0xFF:
        return False
    db = bytearray(a ^ b for a, b in zip(masked, mgf1(h, EM_LEN - H_LEN - 1)))
    db[0] &= 0xFF >> (8 * EM_LEN - EM_BITS)
    if any(db[:PS_LEN]) or db[PS_LEN] != 1:
        return False
    salt = bytes(db[-S_LEN:])
    return sha(b"\x00" * 8 + sha(msg) + salt) == h


seed = 42
salt = []
for _ in range(S_LEN):
    seed = seed * 48271 % 2147483647
    salt.append(seed % 256)
salt = bytes(salt)
msg = b"Pay Bob 100 coins"
em = pss_encode(msg, salt)
sig = pow(int.from_bytes(em, "big"), D, N)
print("mHash:", sha(msg).hex())
print("salt :", salt.hex())
print("EM   :", em.hex())
print("sig  :", f"{sig:0128x}")
print("verify original :", verify(msg, sig, N))
print("verify tampered :", verify(b"Pay Bob 900 coins", sig, N))
print("verify wrong key:", verify(msg, sig, N_OTHER))
