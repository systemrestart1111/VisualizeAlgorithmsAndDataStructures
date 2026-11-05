from math import gcd

# lcm(a, b) = a / gcd(a, b) * b；多個數就依序兩兩求（先除後乘，避免溢位）
nums = [12, 18, 30, 8]
cur = nums[0]
for x in nums[1:]:
    g = gcd(cur, x)
    nxt = cur // g * x
    print(f"lcm({cur}, {x}) = {cur} / {g} x {x} = {nxt}")
    cur = nxt
print("lcm =", cur)
