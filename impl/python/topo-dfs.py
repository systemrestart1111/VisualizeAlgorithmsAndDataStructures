EDGES = "AC BC BD CE DF EF EG FH GH".split()
nodes = sorted({v for e in EDGES for v in e})
adj = {v: [] for v in nodes}
for a, b in EDGES:
    adj[a].append(b)

post, seen = [], set()


def dfs(u):
    """一個點在它所有後繼都處理完後才加入 post；post 反過來就是拓撲順序"""
    seen.add(u)
    for v in adj[u]:
        if v not in seen:
            dfs(v)
    post.append(u)


for v in nodes:
    if v not in seen:
        dfs(v)
print("post-order:", *post)
print("topological:", *reversed(post))
