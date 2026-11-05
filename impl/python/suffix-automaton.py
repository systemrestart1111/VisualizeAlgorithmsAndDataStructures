def build_sam(s):
    """逐字元擴充；len 不連續時複製 clone。回傳 (len, link)"""
    length, link, nxt = [0], [-1], [{}]
    last = 0
    for c in s:
        cur = len(length)
        length.append(length[last] + 1)
        link.append(-1)
        nxt.append({})
        p = last
        while p != -1 and c not in nxt[p]:
            nxt[p][c] = cur
            p = link[p]
        if p == -1:
            link[cur] = 0
        else:
            q = nxt[p][c]
            if length[p] + 1 == length[q]:
                link[cur] = q
            else:
                clone = len(length)
                length.append(length[p] + 1)
                link.append(link[q])
                nxt.append(dict(nxt[q]))
                while p != -1 and nxt[p].get(c) == q:
                    nxt[p][c] = clone
                    p = link[p]
                link[q] = link[cur] = clone
        last = cur
    return length, link


for s in ["abcbcabc", "banana", "aaaa", "abcd"]:
    length, link = build_sam(s)
    distinct = sum(length[v] - length[link[v]] for v in range(1, len(length)))
    brute = len({s[i:j] for i in range(len(s)) for j in range(i + 1, len(s) + 1)})
    print(f"{s}: states {len(length)}, distinct substrings {distinct} (brute {brute})")
