p, g = 23, 5          # 公開
a, b = 6, 15          # 各自的祕密
A = pow(g, a, p)      # Alice 公開
B = pow(g, b, p)      # Bob 公開
s_alice = pow(B, a, p)
s_bob = pow(A, b, p)
print(f"public: p={p} g={g} A={A} B={B}")
print(f"Alice shared = {s_alice}, Bob shared = {s_bob}, equal = {s_alice == s_bob}")
# 較大的質數
p, g, a, b = 2147483647, 7, 123456789, 987654321
A, B = pow(g, a, p), pow(g, b, p)
print(f"p={p}: A={A} B={B} shared={pow(B, a, p)} {pow(A, b, p)}")
