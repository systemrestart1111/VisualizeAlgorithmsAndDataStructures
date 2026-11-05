#include <stdio.h>

int board[9][9];

/* 同列、同欄、同 3x3 宮內都不能出現 d */
int ok(int r, int c, int d) {
    for (int k = 0; k < 9; k++)
        if (board[r][k] == d || board[k][c] == d) return 0;
    int br = r / 3 * 3, bc = c / 3 * 3;
    for (int i = 0; i < 3; i++)
        for (int j = 0; j < 3; j++)
            if (board[br + i][bc + j] == d) return 0;
    return 1;
}

/* 找下一個空格依序試 1..9，填不下去就回溯 */
int solve(void) {
    for (int r = 0; r < 9; r++)
        for (int c = 0; c < 9; c++)
            if (board[r][c] == 0) {
                for (int d = 1; d <= 9; d++)
                    if (ok(r, c, d)) {
                        board[r][c] = d;
                        if (solve()) return 1;
                        board[r][c] = 0;
                    }
                return 0;
            }
    return 1;
}

int main(void) {
    const char *p[] = {"530070000", "600195000", "098000060", "800060003", "400803001", "700020006", "060000280", "000419005", "000080079"};
    for (int r = 0; r < 9; r++)
        for (int c = 0; c < 9; c++) board[r][c] = p[r][c] - '0';
    printf("solved: %s\n", solve() ? "True" : "False");
    for (int r = 0; r < 9; r++)
        for (int c = 0; c < 9; c++) printf("%d%c", board[r][c], c < 8 ? ' ' : '\n');
    return 0;
}
