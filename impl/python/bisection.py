f = lambda x: x ** 3 - 2 * x - 5

# f(a) 與 f(b) 異號時區間內必有根；每次取中點，保留仍然異號的那一半，誤差每步減半
a, b = 1.0, 3.0
for i in range(1, 13):
    m = (a + b) / 2
    if f(a) * f(m) <= 0:
        b = m
    else:
        a = m
    print(f"step {i:2d}: [{a:.12f}, {b:.12f}]")
print(f"root ~ {(a + b) / 2:.12f}")
