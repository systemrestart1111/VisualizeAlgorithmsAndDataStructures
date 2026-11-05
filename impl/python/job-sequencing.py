JOBS = [(2, 100), (1, 19), (2, 27), (1, 25), (3, 15), (3, 40), (4, 30)]  # (截止時間, 利潤)

# 依利潤由高到低考慮；每份工作排進「截止前最晚的空時段」，讓前面的時段留給截止較早的工作
max_d = max(d for d, _ in JOBS)
slot = [None] * (max_d + 1)
total = 0
for i in sorted(range(len(JOBS)), key=lambda i: -JOBS[i][1]):
    d, p = JOBS[i]
    for t in range(d, 0, -1):
        if slot[t] is None:
            slot[t] = i
            total += p
            break
for t in range(1, max_d + 1):
    print(f"slot {t}:", f"J{slot[t] + 1} (profit {JOBS[slot[t]][1]})" if slot[t] is not None else "-")
print("total profit =", total)
