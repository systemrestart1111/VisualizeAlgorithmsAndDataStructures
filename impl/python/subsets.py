def subsets(items):
    """每個節點都是一個子集合：輸出目前的集合，再嘗試從 start 之後加入下一個元素"""
    out, cur = [], []

    def bt(start):
        out.append(cur[:])
        for i in range(start, len(items)):
            cur.append(items[i])
            bt(i + 1)
            cur.pop()

    bt(0)
    return out


res = subsets(["a", "b", "c"])
for s in res:
    print("{" + " ".join(s) + "}")
print("count =", len(res))
