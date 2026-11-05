def msd(words, d=0):
    """依第 d 個字元分桶；在第 d 位已結束的字串放在最前面的結尾桶"""
    if len(words) <= 1:
        return list(words)
    end, buckets = [], {}
    for w in words:
        if len(w) <= d:
            end.append(w)
        else:
            buckets.setdefault(w[d], []).append(w)
    out = end
    for ch in sorted(buckets):
        out += msd(buckets[ch], d + 1)
    return out


words = "she sells sea shells by the sea shore app apple ape".split()
print(*msd(words))
print(*msd(["b", "a", "", "ab", "abc", "aa", "a"]))
