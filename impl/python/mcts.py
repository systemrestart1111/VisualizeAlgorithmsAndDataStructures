import math

LINES = [(0, 1, 2), (3, 4, 5), (6, 7, 8), (0, 3, 6), (1, 4, 7), (2, 5, 8), (0, 4, 8), (2, 4, 6)]
state = 42


def rand_int(k):
    """Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1"""
    global state
    state = state * 48271 % 2147483647
    return state % k


def winner(b):
    for a, c, d in LINES:
        if b[a] != "." and b[a] == b[c] == b[d]:
            return b[a]
    return "draw" if "." not in b else None


class Node:
    def __init__(self, board, just_moved, move, parent):
        self.board, self.just_moved, self.move, self.parent = board, just_moved, move, parent
        self.children, self.wins, self.visits = [], 0.0, 0
        self.untried = [] if winner(board) else [i for i in range(9) if board[i] == "."]


def play(board, i, p):
    return board[:i] + p + board[i + 1:]


def mcts(board, iters):
    """選擇（UCT）→ 擴展 → 隨機模擬到終局 → 把勝負沿路徑往回更新"""
    to_move = "O" if board.count("X") > board.count("O") else "X"
    root = Node(board, "X" if to_move == "O" else "O", None, None)
    for _ in range(iters):
        node = root
        while not node.untried and node.children:  # 1. 選擇：UCB = 勝率 + 1.4·√(ln N / n)
            best, best_v = None, -1.0
            for c in node.children:
                v = c.wins / c.visits + 1.4 * math.sqrt(math.log(node.visits) / c.visits)
                if v > best_v + 1e-12:  # 容許誤差：平手時固定選先展開的子節點
                    best, best_v = c, v
            node = best
        if node.untried:  # 2. 擴展
            m = node.untried.pop(rand_int(len(node.untried)))
            p = "O" if node.just_moved == "X" else "X"
            node.children.append(Node(play(node.board, m, p), p, m, node))
            node = node.children[-1]
        b, p = node.board, node.just_moved  # 3. 隨機模擬
        while winner(b) is None:
            p = "O" if p == "X" else "X"
            empty = [i for i in range(9) if b[i] == "."]
            b = play(b, empty[rand_int(len(empty))], p)
        w = winner(b)
        while node:  # 4. 反向傳播：從「剛走這步的玩家」角度記錄勝負
            node.visits += 1
            node.wins += 1 if w == node.just_moved else 0.5 if w == "draw" else 0
            node = node.parent
    return to_move, root


to_move, root = mcts("X.O.X....", 300)
print("player to move:", to_move)
for c in sorted(root.children, key=lambda c: c.move):
    print(f"move {c.move}: visits {c.visits}, wins {c.wins:.1f}")
best = max(sorted(root.children, key=lambda c: c.move), key=lambda c: c.visits)
print("best move =", best.move)
