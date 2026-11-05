from collections import deque

PATTERNS = ["he", "she", "his", "hers"]
TEXT = "ushershishe"

# 1. 把所有樣式插入字典樹
children, fail, out, dict_link = [{}], [0], [-1], [0]
for idx, p in enumerate(PATTERNS):
    u = 0
    for ch in p:
        if ch not in children[u]:
            children.append({}); fail.append(0); out.append(-1); dict_link.append(0)
            children[u][ch] = len(children) - 1
        u = children[u][ch]
    out[u] = idx

# 2. BFS 建立失配指標：fail[v] = v 所代表字串的最長「也在字典樹中」的真後綴
q = deque(children[0].values())
while q:
    u = q.popleft()
    for ch in sorted(children[u]):
        v = children[u][ch]
        f = fail[u]
        while f and ch not in children[f]:
            f = fail[f]
        fail[v] = children[f][ch] if ch in children[f] and children[f][ch] != v else 0
        dict_link[v] = fail[v] if out[fail[v]] >= 0 else dict_link[fail[v]]  # 沿失配鏈第一個樣式終點
        q.append(v)

# 3. 掃描文字一次：失配就沿 fail 退回，每到一個節點就輸出它及其輸出鏈上的所有樣式
u = 0
for i, ch in enumerate(TEXT):
    while u and ch not in children[u]:
        u = fail[u]
    u = children[u].get(ch, 0)
    x = u if out[u] >= 0 else dict_link[u]
    while x:
        p = PATTERNS[out[x]]
        print(f"pos {i - len(p) + 1}: {p}")
        x = dict_link[x]
