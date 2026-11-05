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

/* BFS：用佇列一層一層處理，每層開始時佇列長度就是這一層的節點數 */
int main(void) {
    int tok[] = {1, 2, 3, 4, 5, 6, 7, NUL, 8, 9, NUL, NUL, 10};
    int q[32], head = 0, tail = 0, d = 0;
    q[tail++] = build_level(tok, sizeof tok / sizeof tok[0]);
    while (head < tail) {
        int size = tail - head;
        printf("level %d:", d++);
        while (size--) {
            int n = q[head++];
            printf(" %d", val[n]);
            if (lft[n] != NUL) q[tail++] = lft[n];
            if (rgt[n] != NUL) q[tail++] = rgt[n];
        }
        printf("\n");
    }
    return 0;
}
