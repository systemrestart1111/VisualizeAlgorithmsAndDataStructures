def fast_power(a, n):
    """把 n 看成二進位，由低位到高位：base 每次平方，該位是 1 時就乘進結果，只需 O(log n) 次乘法"""
    result, base = 1, a
    while n:
        bit = n & 1
        if bit:
            result *= base
        print(f"bit {bit}: result = {result}, base = {base}")
        base *= base
        n >>= 1
    return result


print("3^13 =", fast_power(3, 13))
