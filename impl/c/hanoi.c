#include <stdio.h>

int count;

/* 把 n 個盤子從 src 移到 dst：先把上面 n-1 個移到 aux，移動最大的，再把 n-1 個移到 dst；共 2^n - 1 步 */
void hanoi(int n, char src, char aux, char dst) {
    if (n == 0) return;
    hanoi(n - 1, src, dst, aux);
    printf("%2d. disk %d: %c -> %c\n", ++count, n, src, dst);
    hanoi(n - 1, aux, src, dst);
}

int main(void) {
    hanoi(4, 'A', 'B', 'C');
    printf("total moves = %d\n", count);
    return 0;
}
