EDGES = "AB AD BC BE CF DE EF DG EH FI GH HI".split()
adj = {}
for a, b in EDGES:
    adj.setdefault(a, []).append(b)
    adj.setdefault(b, []).append(a)
n = len(adj)


def ham_path(start):
    """從起點延伸路徑，每次只走沒去過的鄰居；走不下去就退回（回溯），長度達到 n 即成功"""
    path, seen = [start], {start}

    def bt():
        if len(path) == n:
            return True
        for v in adj[path[-1]]:
            if v not in seen:
                path.append(v)
                seen.add(v)
                if bt():
                    return True
                path.pop()
                seen.remove(v)
        return False

    return path if bt() else None


p = ham_path("A")
print("Hamiltonian path:", " -> ".join(p) if p else "none")
