from fractions import Fraction


def two_draws(red, blue, replace):
    """袋中 red 紅 blue 藍連抽兩顆：回傳四種結果的機率（事件樹路徑機率 = 條件機率相乘）"""
    total = red + blue
    out = {}
    for first in "RB":
        p1 = Fraction(red if first == "R" else blue, total)
        r2, b2, t2 = (red, blue, total) if replace else ((red - 1, blue, total - 1) if first == "R" else (red, blue - 1, total - 1))
        for second in "RB":
            out[first + second] = p1 * Fraction(r2 if second == "R" else b2, t2)
    return out


for replace in (True, False):
    p = two_draws(3, 2, replace)
    print("with replacement" if replace else "without replacement")
    for k, v in p.items():
        print(f"  P({k}) = {v}")
    second_red = p["RR"] + p["BR"]
    cond = p["RR"] / (p["RR"] + p["RB"])
    print(f"  P(2nd R) = {second_red}, P(2nd R | 1st R) = {cond}, independent = {second_red == cond}")
    ex = sum(k.count("R") * v for k, v in p.items())
    print(f"  E[#red] = {ex}")
