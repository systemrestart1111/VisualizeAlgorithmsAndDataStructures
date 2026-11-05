# 重量以「乘上 100 的整數」表示，避免浮點數誤差（3.14 -> 314）
ITEMS = [(200, 40), (314, 50), (198, 100), (500, 95), (300, 30)]  # (重量 x100, 價值)
W = 1000
order = sorted(range(len(ITEMS)), key=lambda i: ITEMS[i][1] / ITEMS[i][0], reverse=True)
best, best_set, nodes = 0, [], 0


def bound(k, cap, value):
    """上界：剩下的物品依單位價值貪婪裝入，最後一件可以只裝一部分（分數背包的解一定不比整數解差）"""
    for i in order[k:]:
        w, v = ITEMS[i]
        if w <= cap:
            cap -= w
            value += v
        else:
            return value + v * cap / w
    return value


def dfs(k, cap, value, chosen):
    """分支：第 k 件拿或不拿；限界：上界不超過目前最佳解就剪掉整棵子樹"""
    global best, best_set, nodes
    nodes += 1
    if value > best:
        best, best_set = value, chosen[:]
    if k == len(order) or bound(k, cap, value) <= best + 1e-9:
        return
    i = order[k]
    if ITEMS[i][0] <= cap:
        chosen.append(i)
        dfs(k + 1, cap - ITEMS[i][0], value + ITEMS[i][1], chosen)
        chosen.pop()
    dfs(k + 1, cap, value, chosen)


dfs(0, W, 0, [])
print("best value =", best)
print("items:", *(f"I{i}" for i in sorted(best_set)))
print("nodes explored =", nodes)
