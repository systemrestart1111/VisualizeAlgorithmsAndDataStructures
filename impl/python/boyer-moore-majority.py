def majority(a):
    """多數投票：相同就 +1、不同就 -1，歸零時換候選人；最後再驗證一次是否過半"""
    cand, count = None, 0
    for x in a:
        if count == 0:
            cand = x
        count += 1 if x == cand else -1
    occ = a.count(cand)
    return cand if occ * 2 > len(a) else None, occ


a = [2, 2, 1, 3, 2, 1, 2, 2, 3, 2, 1, 2, 2]
m, occ = majority(a)
print("majority =", m, f"({occ}/{len(a)})")
