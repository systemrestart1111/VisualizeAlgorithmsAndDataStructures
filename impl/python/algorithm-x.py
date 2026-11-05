SETS = {"A": [1, 4, 7], "B": [1, 4], "C": [4, 5, 7], "D": [3, 5, 6], "E": [2, 3, 6, 7], "F": [2, 7]}
COLS = range(1, 8)
names = list(SETS)
active_row = {r: True for r in names}
covered = {c: False for c in COLS}
solutions = []

# Knuth 的 Algorithm X：挑候選最少的欄，逐一嘗試涵蓋它的列；選了某列就移除它的所有欄與衝突的列，失敗再還原
# （舞蹈鏈 Dancing Links 是用雙向環狀鏈結串列讓「移除／還原」變成 O(1) 的實作方式，搜尋邏輯相同）


def search(sol):
    open_cols = [c for c in COLS if not covered[c]]
    if not open_cols:
        solutions.append(sorted(sol))
        return
    cand = {c: [r for r in names if active_row[r] and c in SETS[r]] for c in open_cols}
    col = min(open_cols, key=lambda c: len(cand[c]))  # 同數量時取編號小的欄
    for r in cand[col]:
        sol.append(r)
        removed_cols = SETS[r]
        removed_rows = [r2 for r2 in names if active_row[r2] and any(c in SETS[r2] for c in removed_cols)]
        for c in removed_cols:
            covered[c] = True
        for r2 in removed_rows:
            active_row[r2] = False
        search(sol)
        for r2 in removed_rows:  # 還原
            active_row[r2] = True
        for c in removed_cols:
            covered[c] = False
        sol.pop()


search([])
for s in solutions:
    print("solution: {" + " ".join(s) + "}")
print("total solutions =", len(solutions))
