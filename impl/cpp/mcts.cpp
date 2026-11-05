#include <cmath>
#include <cstdio>
#include <string>
#include <vector>
using namespace std;

const int LINES[8][3] = {{0, 1, 2}, {3, 4, 5}, {6, 7, 8}, {0, 3, 6}, {1, 4, 7}, {2, 5, 8}, {0, 4, 8}, {2, 4, 6}};
long long state = 42;

// Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1
int randInt(int k) {
    state = state * 48271 % 2147483647;
    return (int)(state % k);
}

// 回傳 'X'、'O'、'D'（平手）或 0（未結束）
char winner(const string& b) {
    for (auto& l : LINES)
        if (b[l[0]] != '.' && b[l[0]] == b[l[1]] && b[l[1]] == b[l[2]]) return b[l[0]];
    return b.find('.') == string::npos ? 'D' : 0;
}

struct Node {
    string board;
    char justMoved;
    int move, parent, visits = 0;
    double wins = 0;
    vector<int> children, untried;
};
vector<Node> nodes;

int newNode(const string& board, char justMoved, int move, int parent) {
    Node n;
    n.board = board; n.justMoved = justMoved; n.move = move; n.parent = parent;
    if (!winner(board))
        for (int i = 0; i < 9; i++) if (board[i] == '.') n.untried.push_back(i);
    nodes.push_back(n);
    return (int)nodes.size() - 1;
}

// 選擇（UCT）→ 擴展 → 隨機模擬到終局 → 把勝負沿路徑往回更新
int main() {
    string start = "X.O.X....";
    int xs = 0, os = 0;
    for (char c : start) { xs += c == 'X'; os += c == 'O'; }
    char toMove = xs > os ? 'O' : 'X';
    int root = newNode(start, toMove == 'O' ? 'X' : 'O', -1, -1);
    for (int it = 0; it < 300; it++) {
        int u = root;
        while (nodes[u].untried.empty() && !nodes[u].children.empty()) {  // 1. 選擇：UCB = 勝率 + 1.4·√(ln N / n)
            int best = -1;
            double bestV = -1;
            for (int c : nodes[u].children) {
                double v = nodes[c].wins / nodes[c].visits + 1.4 * sqrt(log((double)nodes[u].visits) / nodes[c].visits);
                if (v > bestV + 1e-12) { best = c; bestV = v; }  // 容許誤差：平手時固定選先展開的子節點
            }
            u = best;
        }
        if (!nodes[u].untried.empty()) {  // 2. 擴展
            int idx = randInt((int)nodes[u].untried.size()), m = nodes[u].untried[idx];
            nodes[u].untried.erase(nodes[u].untried.begin() + idx);
            char p = nodes[u].justMoved == 'X' ? 'O' : 'X';
            string b = nodes[u].board;
            b[m] = p;
            int c = newNode(b, p, m, u);
            nodes[u].children.push_back(c);
            u = c;
        }
        string b = nodes[u].board;  // 3. 隨機模擬
        char p = nodes[u].justMoved, w;
        while (!(w = winner(b))) {
            p = p == 'X' ? 'O' : 'X';
            vector<int> empty;
            for (int i = 0; i < 9; i++) if (b[i] == '.') empty.push_back(i);
            b[empty[randInt((int)empty.size())]] = p;
        }
        for (; u >= 0; u = nodes[u].parent) {  // 4. 反向傳播：從「剛走這步的玩家」角度記錄勝負
            nodes[u].visits++;
            nodes[u].wins += w == nodes[u].justMoved ? 1 : w == 'D' ? 0.5 : 0;
        }
    }
    printf("player to move: %c\n", toMove);
    int best = -1;
    for (int m = 0; m < 9; m++)
        for (int c : nodes[root].children) {
            if (nodes[c].move != m) continue;
            printf("move %d: visits %d, wins %.1f\n", m, nodes[c].visits, nodes[c].wins);
            if (best < 0 || nodes[c].visits > nodes[best].visits) best = c;
        }
    printf("best move = %d\n", nodes[best].move);
}
