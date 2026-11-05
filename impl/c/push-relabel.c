#include <stdio.h>
#include <string.h>

#define N 6
const char *NAMES = "SACBDT";
int cap[N][N], S = 0, T = 5;

int idx(char c) { return (int)(strchr(NAMES, c) - NAMES); }

int main(void) {
    const char *E[] = {"SA10", "SC10", "AB4", "AC2", "AD8", "CD9", "DB6", "BT10", "DT10"};
    for (int i = 0; i < 9; i++) {
        int c;
        sscanf(E[i] + 2, "%d", &c);
        cap[idx(E[i][0])][idx(E[i][1])] += c;
    }
    /* 前置流：先把 S 的出邊全部灌滿；之後不斷把「溢出」的點的多餘流量往較低的鄰居推，推不動就把自己抬高 */
    int height[N] = {0}, excess[N] = {0}, q[1024], head = 0, tail = 0, pushes = 0, relabels = 0;
    height[S] = N;
    for (int v = 0; v < N; v++)
        if (cap[S][v] > 0) {
            excess[v] += cap[S][v];
            cap[v][S] += cap[S][v];
            cap[S][v] = 0;
            if (v != T) q[tail++] = v;
        }
    while (head < tail) { /* FIFO：依序處理溢出的點 */
        int u = q[head++];
        while (excess[u] > 0) {
            for (int v = 0; v < N && excess[u] > 0; v++)
                if (cap[u][v] > 0 && height[u] == height[v] + 1) { /* 只能往低一層推 */
                    int d = excess[u] < cap[u][v] ? excess[u] : cap[u][v];
                    cap[u][v] -= d; cap[v][u] += d;
                    excess[u] -= d; excess[v] += d;
                    pushes++;
                    if (v != S && v != T && excess[v] == d) q[tail++] = v;
                }
            if (excess[u] > 0) { /* 推不出去：抬高到比最低的可達鄰居高一層 */
                int mn = 1 << 30;
                for (int v = 0; v < N; v++) if (cap[u][v] > 0 && height[v] < mn) mn = height[v];
                height[u] = mn + 1;
                relabels++;
            }
        }
    }
    printf("max flow = %d\npushes = %d relabels = %d\n", excess[T], pushes, relabels);
    int reach[N] = {0}, st[N], top = 0;
    reach[S] = 1;
    st[top++] = S;
    while (top) {
        int u = st[--top];
        for (int v = 0; v < N; v++) if (cap[u][v] > 0 && !reach[v]) { reach[v] = 1; st[top++] = v; }
    }
    printf("min cut S-side:");
    for (int v = 0; v < N; v++) if (reach[v]) printf(" %c", NAMES[v]);
    printf("\n");
    return 0;
}
