LEAVES = [3, 5, 6, 9, 1, 2, 0, -1, 8, 4, 7, 2, 5, 1, 3, 6]
B, DEPTH = 2, 4
visited = []


def ab(depth, index, alpha, beta, is_max):
    """α：MAX 已保證的下界，β：MIN 已保證的上界；一旦 α >= β，剩下的兄弟節點不可能影響結果，直接剪掉"""
    if depth == DEPTH:
        visited.append(index)
        return LEAVES[index]
    best = float("-inf") if is_max else float("inf")
    for k in range(B):
        v = ab(depth + 1, index * B + k, alpha, beta, not is_max)
        if is_max:
            best = max(best, v)
            alpha = max(alpha, v)
        else:
            best = min(best, v)
            beta = min(beta, v)
        if alpha >= beta:
            break
    return best


root = ab(0, 0, float("-inf"), float("inf"), True)
print("root value =", root)
print("leaves evaluated:", *visited)
print(f"pruned {len(LEAVES) - len(visited)} of {len(LEAVES)} leaves")
