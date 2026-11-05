#include <stdio.h>

#define N 6
int cols[N], d1[2 * N], d2[2 * N], pos[N], first[N], count;

/* 逐列放皇后；用三個陣列記錄被佔用的欄與兩條對角線，衝突就換下一欄（回溯） */
void bt(int r) {
    if (r == N) {
        if (count++ == 0)
            for (int i = 0; i < N; i++) first[i] = pos[i];
        return;
    }
    for (int c = 0; c < N; c++) {
        if (cols[c] || d1[r - c + N] || d2[r + c]) continue;
        cols[c] = d1[r - c + N] = d2[r + c] = 1;
        pos[r] = c;
        bt(r + 1);
        cols[c] = d1[r - c + N] = d2[r + c] = 0;
    }
}

int main(void) {
    bt(0);
    printf("solutions = %d\n", count);
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) printf("%c%c", c == first[r] ? 'Q' : '.', c + 1 < N ? ' ' : '\n');
    return 0;
}
