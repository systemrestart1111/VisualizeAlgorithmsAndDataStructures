def rabin_karp(t, p, q, d=256):
    """比較雜湊值取代逐字比較；視窗右移一格時用 O(1) 更新雜湊（滾動雜湊）。雜湊相同時仍需確認，避免碰撞"""
    n, m = len(t), len(p)
    h = pow(d, m - 1, q)  # 最高位的權重
    hp = ht = 0
    for i in range(m):
        hp = (hp * d + ord(p[i])) % q
        ht = (ht * d + ord(t[i])) % q
    matches, spurious = [], []
    for s in range(n - m + 1):
        if hp == ht:
            (matches if t[s:s + m] == p else spurious).append(s)
        if s < n - m:
            ht = ((ht - ord(t[s]) * h) * d + ord(t[s + m])) % q
    return matches, spurious


m, sp = rabin_karp("31415926535897932384626", "26", 13)
print("matches at:", *m)
print("spurious hits (hash collision):", *sp)
