DICT = ["apple", "pen", "applepen", "pine", "pineapple", "cats", "dog", "sand", "and", "cat"]


def word_break(s, words):
    """dp[i] = 前 i 個字元的切法數；從每個可到達的 i 沿字典樹往後比對"""
    trie = [{}]
    end = [None]
    for w in words:
        u = 0
        for ch in w:
            if ch not in trie[u]:
                trie[u][ch] = len(trie)
                trie.append({})
                end.append(None)
            u = trie[u][ch]
        end[u] = w
    n = len(s)
    dp = [0] * (n + 1)
    first = [None] * (n + 1)  # 結尾在 j 的單字中，最早開始的那一個
    dp[0] = 1
    for i in range(n):
        if not dp[i]:
            continue
        u, j = 0, i
        while j < n and s[j] in trie[u]:
            u = trie[u][s[j]]
            j += 1
            if end[u]:
                dp[j] += dp[i]
                if first[j] is None:
                    first[j] = (i, end[u])
    parts, j = [], n
    if dp[n]:
        while j > 0:
            i, w = first[j]
            parts.insert(0, w)
            j = i
    return dp[n], parts


for s in ["pineapplepenapple", "catsanddog", "catsandog", ""]:
    ways, parts = word_break(s, DICT)
    print(f"'{s}': {ways} ways" + (f", e.g. {' '.join(parts)}" if ways and parts else ""))
