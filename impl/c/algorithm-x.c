#include <stdio.h>
#include <string.h>

/* Knuth 的 Algorithm X：挑候選最少的欄，逐一嘗試涵蓋它的列；選了某列就移除它的所有欄與衝突的列，失敗再還原
   （舞蹈鏈 Dancing Links 是用雙向環狀鏈結串列讓「移除／還原」變成 O(1) 的實作方式，搜尋邏輯相同） */
#define NR 6
#define NC 7
int has[NR][NC + 1], active[NR], covered[NC + 1], sol[NR], ns, total;
const char *NAMES = "ABCDEF";

void search(void) {
    int col = -1, best = 1 << 30;
    for (int c = 1; c <= NC; c++) {
        if (covered[c]) continue;
        int k = 0;
        for (int r = 0; r < NR; r++) k += active[r] && has[r][c];
        if (k < best) { best = k; col = c; } /* 同數量時取編號小的欄 */
    }
    if (col < 0) {
        int pick[NR] = {0};
        for (int i = 0; i < ns; i++) pick[sol[i]] = 1;
        printf("solution: {");
        for (int r = 0, first = 1; r < NR; r++) if (pick[r]) { printf(first ? "%c" : " %c", NAMES[r]); first = 0; }
        printf("}\n");
        total++;
        return;
    }
    for (int r = 0; r < NR; r++) {
        if (!active[r] || !has[r][col]) continue;
        int removed[NR], nrm = 0;
        sol[ns++] = r;
        for (int r2 = 0; r2 < NR; r2++) {
            if (!active[r2]) continue;
            for (int c = 1; c <= NC; c++)
                if (has[r][c] && has[r2][c]) { removed[nrm++] = r2; break; }
        }
        for (int c = 1; c <= NC; c++) if (has[r][c]) covered[c] = 1;
        for (int i = 0; i < nrm; i++) active[removed[i]] = 0;
        search();
        for (int i = 0; i < nrm; i++) active[removed[i]] = 1; /* 還原 */
        for (int c = 1; c <= NC; c++) if (has[r][c]) covered[c] = 0;
        ns--;
    }
}

int main(void) {
    int sets[NR][4] = {{1, 4, 7}, {1, 4}, {4, 5, 7}, {3, 5, 6}, {2, 3, 6, 7}, {2, 7}};
    for (int r = 0; r < NR; r++) {
        active[r] = 1;
        for (int k = 0; k < 4 && sets[r][k]; k++) has[r][sets[r][k]] = 1;
    }
    search();
    printf("total solutions = %d\n", total);
    return 0;
}
