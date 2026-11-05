#include <stdio.h>

/* 重量以「乘上 100 的整數」表示，避免浮點數誤差（3.14 -> 314） */
int w[] = {200, 314, 198, 500, 300}, v[] = {40, 50, 100, 95, 30}, n = 5, W = 1000;
int order[5], best = 0, best_set[5], nbest = 0, chosen[5], nch = 0, nodes = 0;

/* 上界：剩下的物品依單位價值貪婪裝入，最後一件可以只裝一部分（分數背包的解一定不比整數解差） */
double bound(int k, int cap, int value) {
    double val = value;
    for (int t = k; t < n; t++) {
        int i = order[t];
        if (w[i] <= cap) { cap -= w[i]; val += v[i]; }
        else return val + (double)v[i] * cap / w[i];
    }
    return val;
}

/* 分支：第 k 件拿或不拿；限界：上界不超過目前最佳解就剪掉整棵子樹 */
void dfs(int k, int cap, int value) {
    nodes++;
    if (value > best) {
        best = value;
        nbest = nch;
        for (int i = 0; i < nch; i++) best_set[i] = chosen[i];
    }
    if (k == n || bound(k, cap, value) <= best + 1e-9) return;
    int i = order[k];
    if (w[i] <= cap) {
        chosen[nch++] = i;
        dfs(k + 1, cap - w[i], value + v[i]);
        nch--;
    }
    dfs(k + 1, cap, value);
}

int main(void) {
    for (int i = 0; i < n; i++) order[i] = i;
    for (int i = 1; i < n; i++) { /* 依 v/w 遞減（穩定的插入排序） */
        int k = order[i], j = i - 1;
        while (j >= 0 && (double)v[order[j]] / w[order[j]] < (double)v[k] / w[k]) { order[j + 1] = order[j]; j--; }
        order[j + 1] = k;
    }
    dfs(0, W, 0);
    int mark[5] = {0};
    for (int i = 0; i < nbest; i++) mark[best_set[i]] = 1;
    printf("best value = %d\nitems:", best);
    for (int i = 0; i < n; i++) if (mark[i]) printf(" I%d", i);
    printf("\nnodes explored = %d\n", nodes);
    return 0;
}
