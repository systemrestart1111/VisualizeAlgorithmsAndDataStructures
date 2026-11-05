#include <stdio.h>

/* f(m, e) = f(m−1, e−1) + f(m−1, e) + 1：m 次、e 顆蛋最多能區分的樓層數 */
static int min_drops(int k, int n) {
    long long f[16] = {0};
    int m = 0;
    if (n == 0) return 0;
    while (f[k] < n) {
        m++;
        for (int e = k; e >= 1; e--) f[e] = f[e - 1] + f[e] + 1;
    }
    return m;
}

int main(void) {
    int tests[6][2] = {{2, 36}, {1, 10}, {3, 100}, {2, 0}, {2, 100}, {4, 5000}};
    for (int t = 0; t < 6; t++) printf("%d eggs, %d floors: %d drops\n", tests[t][0], tests[t][1], min_drops(tests[t][0], tests[t][1]));
    return 0;
}
