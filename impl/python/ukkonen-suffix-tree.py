class Node:
    def __init__(self, start, end):
        self.start, self.end, self.kids, self.link = start, end, {}, None


def build(text):
    """Ukkonen：葉子共用全域 end；active point 記住插入位置；新內部節點以 suffix link 串接"""
    leaf_end = [-1]
    root = Node(-1, [-1])
    root.link = root
    a_node, a_edge, a_len, rem = root, 0, 0, 0
    elen = lambda n: n.end[0] - n.start + 1
    for i, c in enumerate(text):
        leaf_end[0] = i
        rem += 1
        last_new = None
        while rem > 0:
            if a_len == 0:
                a_edge = i
            ch = text[a_edge]
            if ch not in a_node.kids:
                a_node.kids[ch] = Node(i, leaf_end)
                if last_new:
                    last_new.link, last_new = a_node, None
            else:
                nxt = a_node.kids[ch]
                if a_len >= elen(nxt):
                    a_edge, a_len, a_node = a_edge + elen(nxt), a_len - elen(nxt), nxt
                    continue
                if text[nxt.start + a_len] == c:
                    if last_new and a_node is not root:
                        last_new.link, last_new = a_node, None
                    a_len += 1
                    break
                split = Node(nxt.start, [nxt.start + a_len - 1])
                split.link = root
                a_node.kids[ch] = split
                split.kids[c] = Node(i, leaf_end)
                nxt.start += a_len
                split.kids[text[nxt.start]] = nxt
                if last_new:
                    last_new.link = split
                last_new = split
            rem -= 1
            if a_node is root and a_len > 0:
                a_len -= 1
                a_edge = i - rem + 1
            elif a_node is not root:
                a_node = a_node.link
    return root


def suffix_array(root, text):
    """依邊的首字元字典序 DFS，葉子的出現順序就是後綴陣列"""
    out = []

    def dfs(n, depth):
        if not n.kids:
            out.append(len(text) - depth)
            return
        for ch in sorted(n.kids):
            k = n.kids[ch]
            dfs(k, depth + k.end[0] - k.start + 1)

    dfs(root, 0)
    return out


for s in ["banana", "abcabxabcd", "mississippi", "aaaa"]:
    t = s + "$"
    sa = suffix_array(build(t), t)
    naive = sorted(range(len(t)), key=lambda i: t[i:])
    print(f"{s}$: leaves {len(sa)}, suffix array {sa}, matches naive {sa == naive}")
