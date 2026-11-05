def eertree(s):
    """兩個虛根（長度 −1、0）；每次從最長回文後綴往上找能在兩側接上 c 的回文"""
    length, link, kids = [-1, 0], [0, 0], [{}, {}]   # 節點 0：長度 −1；節點 1：長度 0
    pal = ["", ""]
    last = 1
    for i, c in enumerate(s):
        fits = lambda v: i - length[v] - 1 >= 0 and s[i - length[v] - 1] == c
        cur = last
        while not fits(cur):
            cur = link[cur]
        if c in kids[cur]:
            last = kids[cur][c]
            continue
        v = len(length)
        length.append(length[cur] + 2)
        pal.append(c if length[v] == 1 else c + pal[cur] + c)
        kids.append({})
        if length[v] == 1:
            link.append(1)
        else:
            w = link[cur]
            while not fits(w):
                w = link[w]
            link.append(kids[w][c])
        kids[cur][c] = v
        last = v
    return pal[2:]


for s in ["abacabadab", "eertree", "aaaa", "abc"]:
    p = eertree(s)
    brute = {s[i:j] for i in range(len(s)) for j in range(i + 1, len(s) + 1) if s[i:j] == s[i:j][::-1]}
    print(f"{s}: {len(p)} palindromes {sorted(p)} (brute {len(brute)})")
