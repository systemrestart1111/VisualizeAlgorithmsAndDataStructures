from collections import deque

MEN = {"A": "XYZW", "B": "YXWZ", "C": "XZYW", "D": "ZWXY"}    # 求婚方的偏好（由高到低）
WOMEN = {"X": "BADC", "Y": "ACBD", "Z": "CDAB", "W": "DBCA"}  # 被求婚方的偏好
rank = {w: {m: i for i, m in enumerate(p)} for w, p in WOMEN.items()}

# 自由的求婚者依序向下一個還沒求過的對象求婚；對方若更喜歡他就換掉現任
free = deque(MEN)
nxt = {m: 0 for m in MEN}
partner = {}  # 被求婚方 -> 求婚方
while free:
    m = free.popleft()
    w = MEN[m][nxt[m]]
    nxt[m] += 1
    if w not in partner:
        partner[w] = m
        print(f"{m} proposes {w}: accepted")
    elif rank[w][m] < rank[w][partner[w]]:
        print(f"{m} proposes {w}: accepted, {partner[w]} is free again")
        free.append(partner[w])
        partner[w] = m
    else:
        print(f"{m} proposes {w}: rejected")
        free.append(m)
print("stable matching:", " ".join(f"{m}-{w}" for w, m in sorted(partner.items(), key=lambda p: p[1])))
