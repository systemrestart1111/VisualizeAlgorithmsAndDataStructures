def mod_pow(a, n, m):
    """由高位到低位的平方乘法：每讀一個位元就把結果平方，該位是 1 再乘上 a；全程取模讓數字保持很小"""
    result = 1
    for bit in bin(n)[2:]:
        result = result * result % m
        if bit == "1":
            result = result * a % m
        print(f"bit {bit}: {result}")
    return result


print("7^560 mod 561 =", mod_pow(7, 560, 561))
