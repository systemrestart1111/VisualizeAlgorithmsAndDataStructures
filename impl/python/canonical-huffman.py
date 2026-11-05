def code_lengths(text):
    """Huffman 只決定碼長；平手時依建立順序（葉子依符號排序在前）"""
    freq = {}
    for c in text:
        freq[c] = freq.get(c, 0) + 1
    syms = sorted(freq)
    if len(syms) == 1:
        return {syms[0]: 1}
    lens = {c: 0 for c in syms}
    nodes = [(freq[c], i, [c]) for i, c in enumerate(syms)]
    order = len(syms)
    while len(nodes) > 1:
        nodes.sort(key=lambda x: (x[0], x[1]))
        (wa, _, la), (wb, _, lb) = nodes[0], nodes[1]
        for c in la + lb:
            lens[c] += 1
        nodes = [(wa + wb, order, la + lb)] + nodes[2:]
        order += 1
    return lens


def canonical(lens):
    """依（碼長, 符號）排序；每個碼是前一個加 1，碼長變長時左移補 0"""
    order = sorted(lens, key=lambda c: (lens[c], c))
    codes, code, prev = {}, 0, lens[order[0]]
    for c in order:
        code <<= lens[c] - prev
        prev = lens[c]
        codes[c] = format(code, f"0{lens[c]}b")
        code += 1
    return codes, order


text = "abracadabra alakazam"
lens = code_lengths(text)
codes, order = canonical(lens)
for c in order:
    print(f"'{c}' len {lens[c]} code {codes[c]}")
enc = "".join(codes[c] for c in text)
rev, buf, dec = {v: k for k, v in codes.items()}, "", ""
for b in enc:
    buf += b
    if buf in rev:
        dec, buf = dec + rev[buf], ""
print(f"bits {len(enc)}, decoded ok {dec == text}")
