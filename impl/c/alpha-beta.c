#include <limits.h>
#include <stdio.h>

int leaves[16] = {3, 5, 6, 9, 1, 2, 0, -1, 8, 4, 7, 2, 5, 1, 3, 6}, B = 2, DEPTH = 4, visited[16], nv;

/* α：MAX 已保證的下界，β：MIN 已保證的上界；一旦 α >= β，剩下的兄弟節點不可能影響結果，直接剪掉 */
int ab(int depth, int index, int alpha, int beta, int is_max) {
    if (depth == DEPTH) { visited[nv++] = index; return leaves[index]; }
    int best = is_max ? INT_MIN : INT_MAX;
    for (int k = 0; k < B; k++) {
        int v = ab(depth + 1, index * B + k, alpha, beta, !is_max);
        if (is_max) { if (v > best) best = v; if (v > alpha) alpha = v; }
        else { if (v < best) best = v; if (v < beta) beta = v; }
        if (alpha >= beta) break;
    }
    return best;
}

int main(void) {
    int root = ab(0, 0, INT_MIN, INT_MAX, 1);
    printf("root value = %d\nleaves evaluated:", root);
    for (int i = 0; i < nv; i++) printf(" %d", visited[i]);
    printf("\npruned %d of 16 leaves\n", 16 - nv);
    return 0;
}
