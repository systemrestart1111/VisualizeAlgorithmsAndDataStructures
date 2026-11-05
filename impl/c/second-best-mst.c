#include <stdio.h>

#define M 9
#define N 6
static char U[M] = {'A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'E'}, V[M] = {'B', 'C', 'C', 'D', 'D', 'E', 'E', 'F', 'F'};
static int W[M] = {4, 3, 1, 2, 4, 5, 6, 7, 3}, inTree[M], p[N];

static int find(int x) { while (p[x] != x) { p[x] = p[p[x]]; x = p[x]; } return x; }
/* 樹上 a 到 b 的路徑：BFS 記錄前一條邊，回傳邊數 */
static int path_edges(int a, int b, int *out) {
    int prevN[N], prevE[N], q[N], h = 0, t = 0, seen[N] = {0};
    q[t++] = a; seen[a] = 1;
    while (h < t) {
        int x = q[h++];
        for (int i = 0; i < M; i++) if (inTree[i]) {
            int u = U[i] - 'A', v = V[i] - 'A', y = u == x ? v : v == x ? u : -1;
            if (y >= 0 && !seen[y]) { seen[y] = 1; prevN[y] = x; prevE[y] = i; q[t++] = y; }
        }
    }
    int k = 0;
    for (int x = b; x != a; x = prevN[x]) out[k++] = prevE[x];
    return k;
}

int main(void) {
    int order[M], total = 0;
    for (int i = 0; i < M; i++) order[i] = i;
    for (int i = 1; i < M; i++) for (int j = i; j > 0 && W[order[j - 1]] > W[order[j]]; j--) { int t = order[j]; order[j] = order[j - 1]; order[j - 1] = t; }
    for (int i = 0; i < N; i++) p[i] = i;
    printf("MST weight: ");
    for (int k = 0; k < M; k++) { int i = order[k], a = find(U[i] - 'A'), b = find(V[i] - 'A'); if (a != b) { p[a] = b; inTree[i] = 1; total += W[i]; } }
    printf("%d edges:", total);
    for (int k = 0; k < M; k++) if (inTree[order[k]]) printf(" %c%c", U[order[k]], V[order[k]]);
    printf("\n");
    for (int strict = 0; strict <= 1; strict++) {
        int best = -1;
        for (int i = 0; i < M; i++) {
            if (inTree[i]) continue;
            int pe[N], k = path_edges(U[i] - 'A', V[i] - 'A', pe), m = -1;
            for (int j = 0; j < k; j++) if ((!strict || W[pe[j]] < W[i]) && W[pe[j]] > m) m = W[pe[j]];
            if (m >= 0 && (best < 0 || total - m + W[i] < best)) best = total - m + W[i];
        }
        printf("%s second best: %d\n", strict ? "strict" : "allow equal", best);
    }
    return 0;
}
