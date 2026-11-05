PTS = [(1, 2), (2, 1), (2, 3), (3, 2), (7, 8), (8, 7), (8, 9), (9, 8), (1, 8), (2, 7), (2, 9), (3, 8)]
K = 3

# Lloyd 演算法：重複「每點分給最近的中心」與「中心移到所屬點的平均位置」，直到分群不再改變
# （這裡用前 k 個點當初始中心，方便重現。這組資料的前 3 點都在同一群，結果會卡在局部最佳解（左下群被拆成兩半），可看出初始化的影響；實務上常用 k-means++ 改善）
cent = [tuple(map(float, p)) for p in PTS[:K]]
assign = [-1] * len(PTS)
for it in range(1, 21):
    new = []
    for x, y in PTS:
        best, bd = 0, float("inf")
        for c, (cx, cy) in enumerate(cent):
            d = (x - cx) ** 2 + (y - cy) ** 2
            if d < bd - 1e-9:  # 容許誤差：距離相同時固定選編號小的中心
                best, bd = c, d
        new.append(best)
    if new == assign:
        break
    assign = new
    for c in range(K):
        members = [PTS[i] for i in range(len(PTS)) if assign[i] == c]
        if members:
            cent[c] = (sum(p[0] for p in members) / len(members), sum(p[1] for p in members) / len(members))
    print(f"iteration {it}:", " ".join(f"({cx:.4f}, {cy:.4f})" for cx, cy in cent))
print("labels:", *assign)
