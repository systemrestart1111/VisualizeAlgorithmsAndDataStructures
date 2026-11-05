def shift_and(text, pat):
    """D 的第 j 位表示 pat[0..j] 目前是否匹配；D = ((D << 1) | 1) & B[c]"""
    m = len(pat)
    assert 0 < m <= 31, "模式超過字寬時需要分塊"
    B = {}
    for j, c in enumerate(pat):
        B[c] = B.get(c, 0) | (1 << j)
    D, out = 0, []
    for i, c in enumerate(text):
        D = ((D << 1) | 1) & B.get(c, 0)
        if D & (1 << (m - 1)):
            out.append(i - m + 1)
    return out


for text, pat in [("abracadabra cadabra", "abra"), ("aaaaa", "aa"), ("the cat sat on the mat", "at"), ("abc", "abcd")]:
    found = shift_and(text, pat)
    brute = [i for i in range(len(text) - len(pat) + 1) if text[i:i + len(pat)] == pat]
    print(f"'{pat}' in '{text}': {found} (brute {brute})")
