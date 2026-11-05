def counting_sort(a):
    """統計每個值出現的次數，再用前綴和決定每個元素的最終位置（穩定）"""
    k = max(a) + 1
    cnt = [0] * k
    for x in a:
        cnt[x] += 1
    for v in range(1, k):
        cnt[v] += cnt[v - 1]
    out = [0] * len(a)
    for x in reversed(a):
        cnt[x] -= 1
        out[cnt[x]] = x
    return out


a = [4, 2, 7, 1, 4, 9, 3, 2, 7, 0, 5, 4, 8, 1]
print(*counting_sort(a))
