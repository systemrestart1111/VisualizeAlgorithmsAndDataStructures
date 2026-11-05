#include <stdio.h>
#include <string.h>

int digits[12], nd;
long long memo[12][120][2];

/* 數位 DP：由高位往低位填數字；tight 表示前面都和 N 相同（這一位不能超過 N 的對應位） */
long long go(int pos, int rest, int tight) {
    if (rest < 0) return 0;
    if (pos == nd) return rest == 0;
    if (memo[pos][rest][tight] >= 0) return memo[pos][rest][tight];
    int top = tight ? digits[pos] : 9;
    long long r = 0;
    for (int d = 0; d <= top; d++) r += go(pos + 1, rest - d, tight && d == top);
    return memo[pos][rest][tight] = r;
}

int main(void) {
    int N = 345, S = 10;
    char buf[16];
    sprintf(buf, "%d", N);
    nd = (int)strlen(buf);
    for (int i = 0; i < nd; i++) digits[i] = buf[i] - '0';
    memset(memo, -1, sizeof memo);
    printf("numbers in [0, %d] with digit sum %d: %lld\n", N, S, go(0, S, 1));
    int brute = 0;
    for (int x = 0; x <= N; x++) {
        int s = 0;
        for (int y = x; y; y /= 10) s += y % 10;
        brute += s == S;
    }
    printf("brute force check: %d\n", brute);
    return 0;
}
