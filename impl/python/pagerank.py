EDGES = "AB AC BC CA DC EA ED FE BD DA".split()
nodes = sorted({v for e in EDGES for v in e})
out = {v: [b for a, b in EDGES if a == v] for v in nodes}
N, D = len(nodes), 0.85

# PR(v) = (1-d)/N + d·Σ PR(u)/出度(u)（u 指向 v）；重複套用直到收斂（冪迭代）
pr = {v: 1 / N for v in nodes}
for it in range(1, 21):
    new = {v: (1 - D) / N for v in nodes}
    for u in nodes:
        for v in out[u]:
            new[v] += D * pr[u] / len(out[u])
    pr = new
    if it in (1, 5, 20):
        print(f"iteration {it:2d}:", " ".join(f"{v}={pr[v]:.4f}" for v in nodes))
print("ranking:", " > ".join(sorted(nodes, key=lambda v: -pr[v])))
print(f"sum = {sum(pr.values()):.4f}")
