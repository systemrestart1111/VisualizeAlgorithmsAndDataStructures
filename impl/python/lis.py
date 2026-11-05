import bisect

A = [10, 9, 2, 5, 3, 7, 101, 18, 4, 20]

# O(n²)：dp[i] = 以 a[i] 結尾的最長遞增子序列長度
n = len(A)
dp, parent = [1] * n, [-1] * n
for i in range(n):
    for j in range(i):
        if A[j] < A[i] and dp[j] + 1 > dp[i]:
            dp[i], parent[i] = dp[j] + 1, j
end = max(range(n), key=lambda i: dp[i])  # 同長度取最先出現的結尾
seq = []
while end >= 0:
    seq.append(A[end])
    end = parent[end]
print("LIS length =", max(dp))
print("one LIS =", *reversed(seq))

# O(n log n)：tails[k] = 長度 k+1 的遞增子序列最小可能結尾，用二分搜尋更新
tails = []
for x in A:
    k = bisect.bisect_left(tails, x)
    if k == len(tails):
        tails.append(x)
    else:
        tails[k] = x
print("tails:", *tails)
