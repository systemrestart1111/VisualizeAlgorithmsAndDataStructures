def permutations(items):
    """每一層選一個還沒用過的元素放進目前位置，到底就輸出；返回時把它標回未使用（回溯）"""
    out, cur, used = [], [], [False] * len(items)

    def bt():
        if len(cur) == len(items):
            out.append(cur[:])
            return
        for i, x in enumerate(items):
            if not used[i]:
                used[i] = True
                cur.append(x)
                bt()
                cur.pop()
                used[i] = False

    bt()
    return out


for p in permutations(["1", "2", "3"]):
    print(" ".join(p))
