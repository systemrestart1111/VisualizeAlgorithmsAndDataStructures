S, L = "banana_bandana", 3
B, M = 131, 1000003

# 前綴雜湊：h[i] = s[0..i) 的多項式雜湊；任意子字串 s[l..r) 的雜湊 = h[r] - h[l]·B^(r-l)，O(1) 取得
n = len(S)
h, pw = [0] * (n + 1), [1] * (n + 1)
for i, ch in enumerate(S):
    h[i + 1] = (h[i] * B + ord(ch)) % M
    pw[i + 1] = pw[i] * B % M


def sub_hash(l, r):
    return (h[r] - h[l] * pw[r - l]) % M


groups = {}  # 雜湊值 -> 出現位置（依第一次出現的順序）
for i in range(n - L + 1):
    groups.setdefault(sub_hash(i, i + L), []).append(i)
print(f"substrings of length {L} appearing more than once:")
for hv, pos in groups.items():
    if len(pos) > 1 and all(S[p:p + L] == S[pos[0]:pos[0] + L] for p in pos):  # 再確認字串真的相同
        print(f"  '{S[pos[0]:pos[0] + L]}' hash={hv} at", *pos)
