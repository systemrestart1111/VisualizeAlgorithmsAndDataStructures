def gcd(a, b):
    """輾轉相除：gcd(a, b) = gcd(b, a mod b)，直到餘數為 0"""
    while b:
        print(f"{a} = {a // b} x {b} + {a % b}")
        a, b = b, a % b
    return a


print("gcd =", gcd(252, 105))
