TASKS = [("A", 3, []), ("B", 2, ["A"]), ("C", 4, ["A"]), ("D", 2, ["B"]), ("E", 2, ["C"]), ("F", 3, ["D", "E"]), ("G", 4, []), ("H", 1, ["G"])]


def cpm(tasks):
    """正向算 ES/EF、反向算 LS/LF；浮時 0 為關鍵工作（工作依前置先後列出）"""
    dur = {n: d for n, d, _ in tasks}
    deps = {n: p for n, _, p in tasks}
    ES, EF = {}, {}
    for n, d, p in tasks:
        ES[n] = max((EF[x] for x in p), default=0)
        EF[n] = ES[n] + d
    T = max(EF.values())
    LS, LF = {}, {}
    for n, d, _ in reversed(tasks):
        succ = [m for m, _, p in tasks if n in p]
        LF[n] = min((LS[m] for m in succ), default=T)
        LS[n] = LF[n] - d
    return T, ES, EF, LS, LF


T, ES, EF, LS, LF = cpm(TASKS)
print("project duration:", T)
print("task dur ES EF LS LF slack")
for n, d, _ in TASKS:
    print(f"{n:>4} {d:>3} {ES[n]:>2} {EF[n]:>2} {LS[n]:>2} {LF[n]:>2} {LS[n] - ES[n]:>5}")
print("critical:", " ".join(n for n, _, _ in TASKS if LS[n] == ES[n]))
