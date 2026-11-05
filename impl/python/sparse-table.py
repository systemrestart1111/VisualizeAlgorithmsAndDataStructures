def build(a):
    """st[j][i] = min(a[i .. i + 2^j − 1])"""
    st = [a[:]]
    j = 1
    while (1 << j) <= len(a):
        prev = st[-1]
        st.append([min(prev[i], prev[i + (1 << (j - 1))]) for i in range(len(a) - (1 << j) + 1)])
        j += 1
    return st


def query(st, l, r):
    """兩段長度 2^k 的區間可以重疊：只適用於 min／max／gcd 等冪等運算"""
    k = (r - l + 1).bit_length() - 1
    return min(st[k][l], st[k][r - (1 << k) + 1])


a = [5, 2, 8, 6, 3, 7, 1, 9, 4, 6, 2, 8]
st = build(a)
for j, row in enumerate(st):
    print(f"2^{j}:", *row)
for l, r in [(0, 4), (3, 9), (6, 6), (0, 11), (8, 11), (2, 5)]:
    print(f"min[{l}, {r}] = {query(st, l, r)} (brute {min(a[l:r + 1])})")
