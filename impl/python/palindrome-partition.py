def min_cut(s):
    """isPal 預算回文區間；cut[j] = 0（整段回文）或 min(cut[i−1] + 1)"""
    n = len(s)
    if n == 0:
        return 0, []
    P = [[False] * n for _ in range(n)]
    for length in range(1, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            P[i][j] = s[i] == s[j] and (length < 3 or P[i + 1][j - 1])
    cut, prev = [0] * n, [0] * n
    for j in range(n):
        if P[0][j]:
            cut[j], prev[j] = 0, 0
            continue
        cut[j] = n
        for i in range(1, j + 1):
            if P[i][j] and cut[i - 1] + 1 < cut[j]:
                cut[j], prev[j] = cut[i - 1] + 1, i
    parts, j = [], n - 1
    while j >= 0:
        parts.insert(0, s[prev[j]:j + 1])
        j = prev[j] - 1
    return cut[-1], parts


for s in ["aabbcbbdd", "aab", "racecar", "abcde", ""]:
    c, parts = min_cut(s)
    print(f"'{s}': {c} cuts", " | ".join(parts))
