MSG = "BACAB"

# 依出現頻率把 [0, 1) 切給各符號；每編一個符號就把目前區間縮小到該符號負責的那一段
freq = {}
for ch in MSG:
    freq[ch] = freq.get(ch, 0) + 1
syms, total = sorted(freq), len(MSG)
cum, acc = {}, 0
for ch in syms:
    cum[ch] = acc
    acc += freq[ch]

# 區間以分數 low/denom、(low+width)/denom 表示，全程整數運算，沒有浮點誤差
def dec(num, k):
    """num / total^k 的十進位表示（total = 5 時恰好是有限小數）"""
    v = num * (10 ** k) // (total ** k) if k else num
    return f"{v // 10 ** k}.{v % 10 ** k:0{k}d}" if k else str(v)


print("model:", " ".join(f"{c}:[{cum[c]}/{total},{cum[c] + freq[c]}/{total})" for c in syms))
low, width = 0, 1
for k, ch in enumerate(MSG, 1):
    low = low * total + width * cum[ch]
    width *= freq[ch]
    print(f"after '{ch}': [{dec(low, k)}, {dec(low + width, k)})")
print(f"code = {dec(low, len(MSG))} (= {low}/{total ** len(MSG)})")

# 解碼：看 code 落在哪個符號的區段，再把它放大回 [0, 1)
out, num, den = [], low, total ** len(MSG)
for _ in range(len(MSG)):
    scaled = num * total  # 比較 num/den 落在哪一段：num*total 與 cum*den 比較
    ch = next(c for c in reversed(syms) if scaled >= cum[c] * den)
    out.append(ch)
    num, den = scaled - cum[ch] * den, den * freq[ch]
print("decoded:", "".join(out))
