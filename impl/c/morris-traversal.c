#include <stdio.h>

#define NUL -1
int val[32], lft[32], rgt[32], cnt;

int build_level(const int *tok, int n) {
    int q[32], head = 0, tail = 0, i = 1;
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

/* 不用堆疊的中序走訪：暫時把左子樹最右節點的 right 指回自己（線索），走完再拆掉，O(1) 額外空間 */
void morris_inorder(int cur) {
    int first = 1;
    while (cur != NUL) {
        if (lft[cur] == NUL) {
            printf(first ? "%d" : " %d", val[cur]); first = 0;
            cur = rgt[cur];
        } else {
            int pre = lft[cur];
            while (rgt[pre] != NUL && rgt[pre] != cur) pre = rgt[pre];
            if (rgt[pre] == NUL) { rgt[pre] = cur; cur = lft[cur]; } /* 第一次到達：建立線索後往左 */
            else {                                                  /* 第二次到達：拆除線索 */
                rgt[pre] = NUL;
                printf(first ? "%d" : " %d", val[cur]); first = 0;
                cur = rgt[cur];
            }
        }
    }
    printf("\n");
}

int main(void) {
    int tok[] = {6, 3, 9, 1, 4, 8, 11, NUL, 2, NUL, 5, 7};
    morris_inorder(build_level(tok, sizeof tok / sizeof tok[0]));
    return 0;
}
