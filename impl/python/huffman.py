TEXT = "ABRACADABRA BANANA"

# 每次取出頻率最小的兩棵樹合併（同頻率時保持先後順序），頻率高的字元自然離根較近、編碼較短
freq = {}
for ch in TEXT:
    freq[ch] = freq.get(ch, 0) + 1
pq = [(f, ch) for ch, f in freq.items()]  # 葉節點以字元表示，內部節點以 (左, 右) 表示
while len(pq) > 1:
    pq.sort(key=lambda t: t[0])  # 穩定排序
    (fa, a), (fb, b) = pq[0], pq[1]
    pq = pq[2:] + [(fa + fb, (a, b))]

codes = {}


def walk(node, code):
    if isinstance(node, str):
        codes[node] = code or "0"
    else:
        walk(node[0], code + "0")
        walk(node[1], code + "1")


walk(pq[0][1], "")
for ch in sorted(codes):
    print(f"{'SP' if ch == ' ' else ch} freq={freq[ch]} code={codes[ch]}")
bits = sum(freq[ch] * len(codes[ch]) for ch in freq)
print(f"total bits = {bits} (fixed 8-bit: {8 * len(TEXT)})")
