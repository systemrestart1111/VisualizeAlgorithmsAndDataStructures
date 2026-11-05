#include <stdio.h>

/* (A - O) × (B - O)：> 0 表示 B 在 OA 左側（逆時針），< 0 在右側，= 0 共線 */
long long cross(long long ox, long long oy, long long ax, long long ay, long long bx, long long by) {
    return (ax - ox) * (by - oy) - (ay - oy) * (bx - ox);
}

int main(void) {
    int B[][2] = {{4, 8}, {9, 1}, {5, 3}, {11, 5}};
    for (int i = 0; i < 4; i++) {
        long long c = cross(2, 2, 8, 4, B[i][0], B[i][1]);
        printf("B=%d,%d: cross = %4lld -> %s\n", B[i][0], B[i][1], c, c > 0 ? "left (counter-clockwise)" : c < 0 ? "right (clockwise)" : "collinear");
    }
    return 0;
}
