#include <stdio.h>

#define NUL -1
int w[32], lft[32], rgt[32], cnt;

int build(const int *tok, int n) {
    int q[32], head = 0, tail = 0, i = 1;
    w[cnt] = tok[0]; lft[cnt] = rgt[cnt] = NUL; q[tail++] = cnt++;
    while (head < tail && i < n) {
        int cur = q[head++];
        for (int side = 0; side < 2 && i < n; side++, i++) {
            if (tok[i] == NUL) continue;
            w[cnt] = tok[i]; lft[cnt] = rgt[cnt] = NUL;
            if (side == 0) lft[cur] = cnt; else rgt[cur] = cnt;
            q[tail++] = cnt++;
        }
    }
    return 0;
}

static int max2(int a, int b) { return a > b ? a : b; }

/* 回傳「選 n」與「不選 n」的最大權重；選了 n 就不能選它的孩子 */
void solve(int n, int *take, int *skip) {
    if (n == NUL) { *take = *skip = 0; return; }
    int lt, ls, rt, rs;
    solve(lft[n], &lt, &ls);
    solve(rgt[n], &rt, &rs);
    *take = w[n] + ls + rs;
    *skip = max2(lt, ls) + max2(rt, rs);
}

int main(void) {
    int tok[] = {3, 4, 5, 1, 3, NUL, 1, 2, NUL, 6, NUL, 4}; /* 層序表示的二元樹，數字為權重 */
    int take, skip;
    solve(build(tok, sizeof tok / sizeof tok[0]), &take, &skip);
    printf("take root: %d skip root: %d\nmax independent set weight = %d\n", take, skip, max2(take, skip));
    return 0;
}
