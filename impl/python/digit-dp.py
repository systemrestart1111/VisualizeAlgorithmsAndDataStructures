from functools import lru_cache


def count_digit_sum(N, S):
    """數位 DP：由高位往低位填數字；tight 表示前面都和 N 相同（這一位不能超過 N 的對應位）"""
    digits = list(map(int, str(N)))

    @lru_cache(maxsize=None)
    def go(pos, rest, tight):
        if rest < 0:
            return 0
        if pos == len(digits):
            return 1 if rest == 0 else 0
        top = digits[pos] if tight else 9
        return sum(go(pos + 1, rest - d, tight and d == top) for d in range(top + 1))

    return go(0, S, True)


N, S = 345, 10
print(f"numbers in [0, {N}] with digit sum {S}:", count_digit_sum(N, S))
print("brute force check:", sum(1 for x in range(N + 1) if sum(map(int, str(x))) == S))
