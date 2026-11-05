state = 42


def rand_int(k):
    """Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1"""
    global state
    state = state * 48271 % 2147483647
    return state % k


a = list(range(1, 13))
# 由後往前，每個位置 i 與 0..i 中隨機一格交換；每種排列出現的機率都是 1/n!
for i in range(len(a) - 1, 0, -1):
    j = rand_int(i + 1)
    a[i], a[j] = a[j], a[i]
print("shuffled:", *a)
