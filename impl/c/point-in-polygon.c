#include <stdio.h>

/* 射線法：從點往右射一條水平線，與多邊形的邊相交奇數次就在內部 */
int inside(long long x, long long y, long long poly[][2], int n) {
    int res = 0;
    for (int i = 0; i < n; i++) {
        long long x1 = poly[i][0], y1 = poly[i][1], x2 = poly[(i + 1) % n][0], y2 = poly[(i + 1) % n][1];
        if ((y1 > y) != (y2 > y)) { /* 這條邊跨過水平線 */
            /* 交點 x 座標 > x 才算在右側；改寫成乘法以避免除法誤差 */
            long long v = (x2 - x1) * (y - y1) - (x - x1) * (y2 - y1);
            if (y2 > y1 ? v > 0 : v < 0) res = !res;
        }
    }
    return res;
}

int main(void) {
    long long poly[][2] = {{2, 1}, {9, 2}, {11, 7}, {7, 5}, {5, 10}, {1, 7}}, q[][2] = {{5, 4}, {8, 7}, {3, 8}, {10, 3}};
    for (int i = 0; i < 4; i++) printf("(%lld,%lld): %s\n", q[i][0], q[i][1], inside(q[i][0], q[i][1], poly, 6) ? "inside" : "outside");
    return 0;
}
