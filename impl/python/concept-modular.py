def norm_mod(a, m):
    """數學上的模：結果落在 [0, m)。Python 的 % 本身就如此，其他語言需加 m 修正"""
    return a % m


nums, m = [-1, 27, 52, 13, -27], 26
for x in nums:
    print(f"{x} mod {m} = {norm_mod(x, m)}")
a, b = nums[0], nums[1]
print(f"({a} + {b}) mod {m} = {norm_mod(a + b, m)} = {norm_mod(norm_mod(a, m) + norm_mod(b, m), m)}")
print(f"({a} * {b}) mod {m} = {norm_mod(a * b, m)} = {norm_mod(norm_mod(a, m) * norm_mod(b, m), m)}")
print("27 ≡ 1 (mod 26):", norm_mod(27, m) == norm_mod(1, m))
