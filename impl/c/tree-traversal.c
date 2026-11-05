#include <stdio.h>

#define NUL -1
/* 以陣列表示二元樹：val / left / right，-1 代表空 */
int val[32], lft[32], rgt[32], cnt;

int build_level(const int *tok, int n) {
    int q[32], head = 0, tail = 0, i = 1;
    cnt = 0;
    val[cnt] = tok[0]; lft[cnt] = rgt[cnt] = NUL; q[tail++] = cnt++;
    while (head < tail && i < n) {
        int cur = q[head++];
        for (int side = 0; side < 2 && i < n; side++, i++) {
            if (tok[i] == NUL) continue;
            val[cnt] = tok[i]; lft[cnt] = rgt[cnt] = NUL;
            if (side == 0) lft[cur] = cnt; else rgt[cur] = cnt;
            q[tail++] = cnt++;
        }
    }
    return 0;
}

void pre(int n) { if (n == NUL) return; printf(" %d", val[n]); pre(lft[n]); pre(rgt[n]); }   /* 根 → 左 → 右 */
void in(int n) { if (n == NUL) return; in(lft[n]); printf(" %d", val[n]); in(rgt[n]); }      /* 左 → 根 → 右 */
void post(int n) { if (n == NUL) return; post(lft[n]); post(rgt[n]); printf(" %d", val[n]); } /* 左 → 右 → 根 */

int main(void) {
    int tok[] = {1, 2, 3, 4, 5, 6, 7, NUL, 8, 9, NUL, NUL, 10};
    int root = build_level(tok, sizeof tok / sizeof tok[0]);
    printf("pre:"); pre(root); printf("\n");
    printf("in:"); in(root); printf("\n");
    printf("post:"); post(root); printf("\n");
    return 0;
}
