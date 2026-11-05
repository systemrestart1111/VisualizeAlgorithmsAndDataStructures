import java.util.ArrayList;
import java.util.List;

public class MCTS {
    static final int[][] LINES = {{0, 1, 2}, {3, 4, 5}, {6, 7, 8}, {0, 3, 6}, {1, 4, 7}, {2, 5, 8}, {0, 4, 8}, {2, 4, 6}};
    static long state = 42;

    // Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1
    static int randInt(int k) {
        state = state * 48271 % 2147483647;
        return (int) (state % k);
    }

    // 回傳 'X'、'O'、'D'（平手）或 0（未結束）
    static char winner(char[] b) {
        for (int[] l : LINES)
            if (b[l[0]] != '.' && b[l[0]] == b[l[1]] && b[l[1]] == b[l[2]]) return b[l[0]];
        for (char c : b) if (c == '.') return 0;
        return 'D';
    }

    static class Node {
        char[] board;
        char justMoved;
        int move, visits;
        double wins;
        Node parent;
        List<Node> children = new ArrayList<>();
        List<Integer> untried = new ArrayList<>();

        Node(char[] board, char justMoved, int move, Node parent) {
            this.board = board; this.justMoved = justMoved; this.move = move; this.parent = parent;
            if (winner(board) == 0)
                for (int i = 0; i < 9; i++) if (board[i] == '.') untried.add(i);
        }
    }

    // 選擇（UCT）→ 擴展 → 隨機模擬到終局 → 把勝負沿路徑往回更新
    public static void main(String[] args) {
        char[] start = "X.O.X....".toCharArray();
        int xs = 0, os = 0;
        for (char c : start) { if (c == 'X') xs++; if (c == 'O') os++; }
        char toMove = xs > os ? 'O' : 'X';
        Node root = new Node(start, toMove == 'O' ? 'X' : 'O', -1, null);
        for (int it = 0; it < 300; it++) {
            Node node = root;
            while (node.untried.isEmpty() && !node.children.isEmpty()) { // 1. 選擇：UCB = 勝率 + 1.4·√(ln N / n)
                Node best = null;
                double bestV = -1;
                for (Node c : node.children) {
                    double v = c.wins / c.visits + 1.4 * Math.sqrt(Math.log(node.visits) / c.visits);
                    if (v > bestV + 1e-12) { best = c; bestV = v; } // 容許誤差：平手時固定選先展開的子節點
                }
                node = best;
            }
            if (!node.untried.isEmpty()) { // 2. 擴展
                int m = node.untried.remove(randInt(node.untried.size()));
                char p = node.justMoved == 'X' ? 'O' : 'X';
                char[] b = node.board.clone();
                b[m] = p;
                Node c = new Node(b, p, m, node);
                node.children.add(c);
                node = c;
            }
            char[] b = node.board.clone(); // 3. 隨機模擬
            char p = node.justMoved, w;
            while ((w = winner(b)) == 0) {
                p = p == 'X' ? 'O' : 'X';
                List<Integer> empty = new ArrayList<>();
                for (int i = 0; i < 9; i++) if (b[i] == '.') empty.add(i);
                b[empty.get(randInt(empty.size()))] = p;
            }
            for (; node != null; node = node.parent) { // 4. 反向傳播：從「剛走這步的玩家」角度記錄勝負
                node.visits++;
                node.wins += w == node.justMoved ? 1 : w == 'D' ? 0.5 : 0;
            }
        }
        System.out.println("player to move: " + toMove);
        Node best = null;
        for (int m = 0; m < 9; m++)
            for (Node c : root.children) {
                if (c.move != m) continue;
                System.out.println(String.format("move %d: visits %d, wins %.1f", m, c.visits, c.wins));
                if (best == null || c.visits > best.visits) best = c;
            }
        System.out.println("best move = " + best.move);
    }
}
