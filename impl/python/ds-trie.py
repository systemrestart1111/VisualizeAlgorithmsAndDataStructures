class TrieNode:
    def __init__(self):
        self.kids, self.end = {}, False


class Trie:
    """每條從根出發的路徑代表一個前綴；end 標記「到這裡是一個完整單字」"""

    def __init__(self):
        self.root, self.nodes = TrieNode(), 1

    def insert(self, w):
        cur = self.root
        for ch in w:
            if ch not in cur.kids:
                cur.kids[ch] = TrieNode()
                self.nodes += 1
            cur = cur.kids[ch]
        cur.end = True

    def _find(self, p):
        cur = self.root
        for ch in p:
            cur = cur.kids.get(ch)
            if cur is None:
                return None
        return cur

    def search(self, w):
        n = self._find(w)
        return n is not None and n.end

    def starts_with(self, p):
        out, n = [], self._find(p)

        def dfs(node, s):  # 依字母序走訪，收集完整單字
            if node.end:
                out.append(s)
            for ch in sorted(node.kids):
                dfs(node.kids[ch], s + ch)

        if n:
            dfs(n, p)
        return out

    def delete(self, w):
        if not self.search(w):
            return False
        path, cur = [self.root], self.root
        for ch in w:
            cur = cur.kids[ch]
            path.append(cur)
        cur.end = False
        for i in range(len(w), 0, -1):  # 從尾端往回剪掉不再需要的節點
            node = path[i]
            if node.end or node.kids:
                break
            del path[i - 1].kids[w[i - 1]]
            self.nodes -= 1
        return True


def b(x):
    return "True" if x else "False"


t = Trie()
for w in ["tea", "ten", "to", "inn", "in", "tree", "try"]:
    t.insert(w)
print("words:", " ".join(t.starts_with("")), f"(nodes = {t.nodes})")
print("search tea ->", b(t.search("tea")), " search te ->", b(t.search("te")), "(prefix only)")
for p in ["te", "tr", "x"]:
    print(f'prefix "{p}":', " ".join(t.starts_with(p)) or "-")
for w in ["in", "tree", "tea"]:
    ok = t.delete(w)
    print(f"delete {w} -> {b(ok)}:", " ".join(t.starts_with("")), f"(nodes = {t.nodes})")
