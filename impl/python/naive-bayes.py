import math

TRAIN = [("spam", "free money now"), ("spam", "win free prize now"), ("spam", "claim your free money"), ("spam", "cheap prize offer"),
         ("ham", "meeting at noon"), ("ham", "project meeting notes"), ("ham", "lunch at noon tomorrow"), ("ham", "your project report")]


def train():
    vocab = sorted({w for _, t in TRAIN for w in t.split()})
    count = {"spam": {}, "ham": {}}
    total = {"spam": 0, "ham": 0}
    for c, t in TRAIN:
        for w in t.split():
            count[c][w] = count[c].get(w, 0) + 1
            total[c] += 1
    return vocab, count, total


def classify(msg, alpha):
    """score[c] = log P(c) + Σ log((count + α) / (total + α|V|))；α = 0 時未見過的字得到 −∞"""
    vocab, count, total = train()
    scores = {}
    for c in ["spam", "ham"]:
        s = math.log(sum(1 for k, _ in TRAIN if k == c) / len(TRAIN))
        for w in msg.split():
            num = count[c].get(w, 0) + alpha
            if num == 0:
                s = -math.inf
                break
            s += math.log(num / (total[c] + alpha * len(vocab)))
        scores[c] = s
    return scores


fmt = lambda v: "-inf" if v == -math.inf else f"{v:.3f}"
for msg in ["free lunch meeting", "win cheap money", "project notes tomorrow", "free coffee now"]:
    for alpha in [1, 0]:
        sc = classify(msg, alpha)
        if sc["spam"] == -math.inf and sc["ham"] == -math.inf:
            pred = "undecidable"
        else:
            pred = "spam" if sc["spam"] >= sc["ham"] else "ham"
        print(f"'{msg}', alpha {alpha}: spam {fmt(sc['spam'])}, ham {fmt(sc['ham'])} -> {pred}")
