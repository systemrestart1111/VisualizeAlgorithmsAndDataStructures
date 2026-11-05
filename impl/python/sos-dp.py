def sos(a):
    """一次處理一個位元：含第 b 位的 mask 加上「去掉第 b 位」的值"""
    n = len(a).bit_length() - 1
    F = a[:]
    for b in range(n):
        for mask in range(len(a)):
            if mask >> b & 1:
                F[mask] += F[mask ^ (1 << b)]
    return F


def brute(a):
    out = []
    for m in range(len(a)):
        s, sub = 0, m
        while True:
            s += a[sub]
            if sub == 0:
                break
            sub = (sub - 1) & m
        out.append(s)
    return out


a = [3, 1, 4, 1, 5, 9, 2, 6]
F = sos(a)
print("F:", *F)
print("matches brute force:", F == brute(a))
b = list(range(1, 17))
print("F (16):", *sos(b), "| ok:", sos(b) == brute(b))
