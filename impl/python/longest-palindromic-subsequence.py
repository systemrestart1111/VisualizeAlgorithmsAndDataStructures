def lps(s):
    """L[i][j]：兩端相同 → L[i+1][j−1] + 2；不同 → max(L[i+1][j], L[i][j−1])"""
    n = len(s)
    L = [[0] * n for _ in range(n)]
    for i in range(n):
        L[i][i] = 1
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if s[i] == s[j]:
                L[i][j] = (L[i + 1][j - 1] if length > 2 else 0) + 2
            else:
                L[i][j] = max(L[i + 1][j], L[i][j - 1])
    left, right, i, j = [], [], 0, n - 1
    while i <= j:  # 回溯出一個回文
        if i == j:
            left.append(s[i])
            break
        if s[i] == s[j]:
            left.append(s[i])
            right.insert(0, s[j])
            i, j = i + 1, j - 1
        elif L[i + 1][j] >= L[i][j - 1]:
            i += 1
        else:
            j -= 1
    return L[0][n - 1], "".join(left + right)


for s in ["BBABCBCAB", "CHARACTER", "AGBDBA", "X"]:
    length, pal = lps(s)
    print(f"{s}: {length} ({pal})")
