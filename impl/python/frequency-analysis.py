EN = [8.17, 1.49, 2.78, 4.25, 12.7, 2.23, 2.02, 6.09, 6.97, 0.15, 0.77, 4.03, 2.41, 6.75, 7.51, 1.93, 0.1, 5.99, 6.33, 9.06, 2.76, 0.98, 2.36, 0.15, 1.97, 0.07]


def crack(cipher):
    """對每個位移計算卡方距離，越小越像英文"""
    letters = [ord(c) - 65 for c in cipher.upper() if "A" <= c.upper() <= "Z"]
    n = len(letters)
    cnt = [0] * 26
    for x in letters:
        cnt[x] += 1
    chi = []
    for k in range(26):
        s = 0.0
        for c in range(26):
            e = n * EN[c] / 100
            s += (cnt[(c + k) % 26] - e) ** 2 / e
        chi.append(s)
    return cnt, chi


cipher = "WKH TXLFN EURZQ IRA MXPSV RYHU WKH ODCB GRJ. IUHTXHQFB DQDOBVLV LV D FODVVLF ZDB WR EUHDN VXEVWLWXWLRQ FLSKHUV"
cnt, chi = crack(cipher)
print("counts:", " ".join(f"{chr(65 + i)}{c}" for i, c in enumerate(cnt) if c))
order = sorted(range(26), key=lambda k: chi[k])
for k in order[:3]:
    print(f"shift {k}: chi2 = {chi[k]:.2f}")
best = order[0]
print("plain:", "".join(chr((ord(c) - 65 - best) % 26 + 65) if "A" <= c <= "Z" else c for c in cipher))
