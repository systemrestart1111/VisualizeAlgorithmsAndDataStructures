#include <stdio.h>

#define W 5
static int ch[64 * W][2], cnt[64 * W], nodes = 1;

/* 固定 W 位元，由高位到低位；每個節點記錄經過的數字個數，支援重複與刪除 */
static void add(int x, int d) {
    int u = 0;
    cnt[0] += d;
    for (int i = W - 1; i >= 0; i--) {
        int b = (x >> i) & 1;
        if (!ch[u][b]) ch[u][b] = nodes++;
        u = ch[u][b];
        cnt[u] += d;
    }
}
/* 每一位盡量走與 x 相反的分支（節點 0 是根，子節點編號 0 表示不存在） */
static int max_xor(int x) {
    int u = 0, y = 0;
    for (int i = W - 1; i >= 0; i--) {
        int b = (x >> i) & 1, v = ch[u][1 - b];
        if (v && cnt[v] > 0) { u = v; y |= (1 - b) << i; }
        else { u = ch[u][b]; y |= b << i; }
    }
    return y;
}

int main(void) {
    int xs[] = {3, 10, 5, 25, 2, 8}, qs[] = {5, 25, 7, 31, 0};
    for (int i = 0; i < 6; i++) add(xs[i], 1);
    for (int i = 0; i < 5; i++) { int y = max_xor(qs[i]); printf("max xor with %2d: %2d -> %d\n", qs[i], y, qs[i] ^ y); }
    add(25, -1);
    int y = max_xor(5);
    printf("after delete 25, max xor with 5: %d -> %d\n", y, 5 ^ y);
    return 0;
}
