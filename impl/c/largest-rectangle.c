#include <stdio.h>

/* 單調遞增堆疊：柱子被彈出時，它的左右邊界就確定了，可算出以它為高的最大矩形 */
int main(void) {
    int h[] = {2, 1, 5, 6, 2, 3, 4, 1, 3}, stack[16], top = 0;
    int n = sizeof h / sizeof h[0], best = 0, bl = 0, br = 0;
    for (int i = 0; i <= n; i++) {
        int cur = i < n ? h[i] : 0; /* 最後補一根高度 0 的柱子把堆疊清空 */
        while (top && h[stack[top - 1]] >= cur) {
            int height = h[stack[--top]];
            int left = top ? stack[top - 1] + 1 : 0;
            int area = height * (i - left);
            if (area > best) { best = area; bl = left; br = i - 1; }
        }
        stack[top++] = i;
    }
    printf("max area = %d, bars [%d, %d]\n", best, bl, br);
    return 0;
}
