def count_k(a, k):
    """以前綴和 p 結尾的子陣列個數 = 之前出現過幾次前綴和 p − k；先查詢再登錄"""
    cnt = {0: 1}
    p = ans = 0
    for x in a:
        p += x
        ans += cnt.get(p - k, 0)
        cnt[p] = cnt.get(p, 0) + 1
    return ans


for a, k in (([1, 2, -1, 3, 0, -2, 4, 1, -3], 3), ([0, 0, 0], 0), ([1, -1, 1, -1], 0), ([5], 3)):
    brute = sum(1 for i in range(len(a)) for j in range(i, len(a)) if sum(a[i:j + 1]) == k)
    print(a, "k =", k, "->", count_k(a, k), "brute:", brute)
