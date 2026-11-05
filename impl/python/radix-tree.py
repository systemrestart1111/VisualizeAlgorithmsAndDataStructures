class Node:
    def __init__(self):
        self.end, self.kids = False, {}  # 首字元 → (邊標籤, 子節點)


def insert(root, w):
    """共享一部分的邊要在分岔處分裂"""
    n, i = root, 0
    while i < len(w):
        if w[i] not in n.kids:
            leaf = Node()
            leaf.end = True
            n.kids[w[i]] = (w[i:], leaf)
            return
        label, child = n.kids[w[i]]
        k = 0
        while k < len(label) and i + k < len(w) and label[k] == w[i + k]:
            k += 1
        if k == len(label):
            n, i = child, i + k
            continue
        mid = Node()
        mid.kids[label[k]] = (label[k:], child)
        n.kids[w[i]] = (label[:k], mid)
        n, i = mid, i + k
    n.end = True


def walk(root, w):
    """回傳 (停下的節點, 是否在邊的中間)；找不到回傳 (None, False)"""
    n, i = root, 0
    while i < len(w):
        if w[i] not in n.kids:
            return None, False
        label, child = n.kids[w[i]]
        part = w[i:i + len(label)]
        if not label.startswith(part):
            return None, False
        if len(part) < len(label):
            return child, True
        n, i = child, i + len(label)
    return n, False


def count(n):
    return int(n.end) + sum(count(c) for _, c in n.kids.values())


def dump(n, depth=0):
    for ch in sorted(n.kids):
        label, c = n.kids[ch]
        print("  " * depth + label + ("*" if c.end else ""))
        dump(c, depth + 1)


root = Node()
for w in ["romane", "romanus", "romulus", "rubens", "ruber", "rubicon", "rubicundus", "rom"]:
    insert(root, w)
dump(root)
for w in ["rom", "romane", "rub", "roman"]:
    n, mid = walk(root, w)
    print(f"search {w}:", n is not None and not mid and n.end)
for p in ["r", "rom", "rub", "rubi", "ru", "x"]:
    n, _ = walk(root, p)
    print(f"prefix {p}:", count(n) if n else 0)
