#include <math.h>
#include <stdio.h>
#include <string.h>

int LINES[8][3] = {{0, 1, 2}, {3, 4, 5}, {6, 7, 8}, {0, 3, 6}, {1, 4, 7}, {2, 5, 8}, {0, 4, 8}, {2, 4, 6}};
long long state = 42;

/* Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1 */
int rand_int(int k) {
    state = state * 48271 % 2147483647;
    return (int)(state % k);
}

/* 回傳 'X'、'O'、'D'（平手）或 0（未結束） */
char winner(const char *b) {
    for (int i = 0; i < 8; i++)
        if (b[LINES[i][0]] != '.' && b[LINES[i][0]] == b[LINES[i][1]] && b[LINES[i][1]] == b[LINES[i][2]]) return b[LINES[i][0]];
    return strchr(b, '.') ? 0 : 'D';
}

typedef struct {
    char board[10], just_moved;
    int move, parent, children[9], nch, untried[9], nun, visits;
    double wins;
} Node;
Node nodes[4000];
int cnt;

int new_node(const char *board, char just_moved, int move, int parent) {
    Node *n = &nodes[cnt];
    strcpy(n->board, board);
    n->just_moved = just_moved; n->move = move; n->parent = parent;
    n->nch = n->nun = n->visits = 0; n->wins = 0;
    if (!winner(board))
        for (int i = 0; i < 9; i++) if (board[i] == '.') n->untried[n->nun++] = i;
    return cnt++;
}

/* 選擇（UCT）→ 擴展 → 隨機模擬到終局 → 把勝負沿路徑往回更新 */
int main(void) {
    const char *start = "X.O.X....";
    int xs = 0, os = 0;
    for (int i = 0; i < 9; i++) { xs += start[i] == 'X'; os += start[i] == 'O'; }
    char to_move = xs > os ? 'O' : 'X';
    int root = new_node(start, to_move == 'O' ? 'X' : 'O', -1, -1);
    for (int it = 0; it < 300; it++) {
        int u = root;
        while (nodes[u].nun == 0 && nodes[u].nch > 0) { /* 1. 選擇：UCB = 勝率 + 1.4·√(ln N / n) */
            int best = -1;
            double best_v = -1;
            for (int k = 0; k < nodes[u].nch; k++) {
                Node *c = &nodes[nodes[u].children[k]];
                double v = c->wins / c->visits + 1.4 * sqrt(log((double)nodes[u].visits) / c->visits);
                if (v > best_v + 1e-12) { best = nodes[u].children[k]; best_v = v; } /* 容許誤差：平手時固定選先展開的子節點 */
            }
            u = best;
        }
        if (nodes[u].nun > 0) { /* 2. 擴展 */
            int idx = rand_int(nodes[u].nun), m = nodes[u].untried[idx];
            for (int k = idx; k + 1 < nodes[u].nun; k++) nodes[u].untried[k] = nodes[u].untried[k + 1];
            nodes[u].nun--;
            char p = nodes[u].just_moved == 'X' ? 'O' : 'X', b[10];
            strcpy(b, nodes[u].board);
            b[m] = p;
            int c = new_node(b, p, m, u);
            nodes[u].children[nodes[u].nch++] = c;
            u = c;
        }
        char b[10], p = nodes[u].just_moved, w; /* 3. 隨機模擬 */
        strcpy(b, nodes[u].board);
        while (!(w = winner(b))) {
            p = p == 'X' ? 'O' : 'X';
            int empty[9], ne = 0;
            for (int i = 0; i < 9; i++) if (b[i] == '.') empty[ne++] = i;
            b[empty[rand_int(ne)]] = p;
        }
        for (; u >= 0; u = nodes[u].parent) { /* 4. 反向傳播：從「剛走這步的玩家」角度記錄勝負 */
            nodes[u].visits++;
            nodes[u].wins += w == nodes[u].just_moved ? 1 : w == 'D' ? 0.5 : 0;
        }
    }
    printf("player to move: %c\n", to_move);
    int best = -1;
    for (int m = 0; m < 9; m++)
        for (int k = 0; k < nodes[root].nch; k++) {
            Node *c = &nodes[nodes[root].children[k]];
            if (c->move != m) continue;
            printf("move %d: visits %d, wins %.1f\n", m, c->visits, c->wins);
            if (best < 0 || c->visits > nodes[best].visits) best = nodes[root].children[k];
        }
    printf("best move = %d\n", nodes[best].move);
    return 0;
}
