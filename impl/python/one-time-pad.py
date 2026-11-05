class ParkMiller:
    """與其他語言一致的示範亂數；真正的 OTP 需要密碼學安全的亂數"""

    def __init__(self, seed):
        self.s = seed

    def byte(self):
        self.s = self.s * 48271 % 2147483647
        return self.s % 256


m1, m2 = b"HELLO WORLD", b"SECRET PLAN"
rng = ParkMiller(42)
key = bytes(rng.byte() for _ in range(max(len(m1), len(m2))))
c1 = bytes(a ^ k for a, k in zip(m1, key))
c2 = bytes(a ^ k for a, k in zip(m2, key))
print("key :", key.hex())
print("c1  :", c1.hex())
print("back:", bytes(c ^ k for c, k in zip(c1, key)).decode())
x1 = bytes(a ^ b for a, b in zip(c1, c2))
x2 = bytes(a ^ b for a, b in zip(m1, m2))
print("c1^c2:", x1.hex())
print("m1^m2:", x2.hex())
print("key reuse leaks m1^m2:", x1 == x2)
