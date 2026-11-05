state = 42


def rand_int(k):
    """Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1"""
    global state
    state = state * 48271 % 2147483647
    return state % k


STREAM = [12, 45, 7, 33, 89, 21, 64, 3, 58, 90, 17, 76, 40, 5, 61]
K = 4
# 演算法 R：先放前 k 個；第 i 個（0 起算）元素以 k/(i+1) 的機率取代蓄水池中隨機一格
# 不需事先知道串流長度，最後每個元素被選中的機率都是 k/n
res = STREAM[:K]
for i in range(K, len(STREAM)):
    j = rand_int(i + 1)
    if j < K:
        print(f"item {STREAM[i]} replaces slot {j} ({res[j]})")
        res[j] = STREAM[i]
print("sample:", *res)
