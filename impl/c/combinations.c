#include <stdio.h>

int n = 5, k = 3, cur[8], depth, count;

/* 從 start 開始挑下一個數，保證組合內遞增、不會重複；剩下的數不夠湊滿 k 個就剪枝 */
void bt(int start) {
    if (depth == k) {
        for (int i = 0; i < k; i++) printf(i ? " %d" : "%d", cur[i]);
        printf("\n");
        count++;
        return;
    }
    for (int x = start; x <= n - (k - depth) + 1; x++) {
        cur[depth++] = x;
        bt(x + 1);
        depth--;
    }
}

int main(void) {
    bt(1);
    printf("count = %d\n", count);
    return 0;
}
