#include <stdio.h>
#include <string.h>

static int R;
static long long dp[1 << 8], nd[1 << 8];

/* 遮罩 cur 為本欄已被佔的列，nxt 為下一欄被橫放骨牌佔走的列 */
static void fill(int row, int cur, int nxt, long long ways) {
    if (row == R) { nd[nxt] += ways; return; }
    if (cur >> row & 1) { fill(row + 1, cur, nxt, ways); return; }
    fill(row + 1, cur, nxt | (1 << row), ways);                              /* 橫放 */
    if (row + 1 < R && !(cur >> (row + 1) & 1)) fill(row + 2, cur, nxt, ways); /* 直放 */
}
static long long tilings(int r, int C) {
    R = r;
    memset(dp, 0, sizeof dp);
    dp[0] = 1;
    for (int c = 0; c < C; c++) {
        memset(nd, 0, sizeof nd);
        for (int m = 0; m < (1 << R); m++) if (dp[m]) fill(0, m, 0, dp[m]);
        memcpy(dp, nd, sizeof dp);
    }
    return dp[0];
}
static int g[8][8], BR, BC;
static long long go(int pos) {
    if (pos == BR * BC) return 1;
    int i = pos / BC, j = pos % BC;
    if (g[i][j]) return go(pos + 1);
    long long t = 0;
    if (j + 1 < BC && !g[i][j + 1]) { g[i][j] = g[i][j + 1] = 1; t += go(pos + 1); g[i][j] = g[i][j + 1] = 0; }
    if (i + 1 < BR) { g[i][j] = g[i + 1][j] = 1; t += go(pos + 1); g[i][j] = g[i + 1][j] = 0; }
    return t;
}

int main(void) {
    int tests[6][2] = {{3, 4}, {2, 8}, {4, 4}, {3, 3}, {4, 6}, {6, 6}};
    for (int t = 0; t < 6; t++) {
        int r = tests[t][0], c = tests[t][1];
        printf("%dx%d: %lld tilings", r, c, tilings(r, c));
        if (r * c <= 24) { BR = r; BC = c; memset(g, 0, sizeof g); printf(" (brute %lld)", go(0)); }
        printf("\n");
    }
    return 0;
}
