TRAIN = [(2, 3, 0), (3, 5, 0), (4, 2, 0), (1, 6, 0), (5, 4, 0), (3, 3, 0), (8, 8, 1), (9, 6, 1),
         (7, 9, 1), (10, 8, 1), (8, 6, 1), (6, 7, 1), (5, 9, 2), (3, 9, 2), (4, 10, 2), (2, 8, 2)]
QUERY, K = (6, 5), 5

# 找出離查詢點最近的 k 筆訓練資料，以多數決決定類別（票數相同時取編號小的類別）
order = sorted(range(len(TRAIN)), key=lambda i: ((TRAIN[i][0] - QUERY[0]) ** 2 + (TRAIN[i][1] - QUERY[1]) ** 2, i))
votes = {}
for i in order[:K]:
    x, y, c = TRAIN[i]
    print(f"neighbor ({x},{y}) class {c}, d^2 = {(x - QUERY[0]) ** 2 + (y - QUERY[1]) ** 2}")
    votes[c] = votes.get(c, 0) + 1
pred = min(votes, key=lambda c: (-votes[c], c))
print("votes:", " ".join(f"class {c}={votes[c]}" for c in sorted(votes)))
print("predicted class =", pred)
