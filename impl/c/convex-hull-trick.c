#include <stdio.h>

typedef long long ll;
typedef struct { ll m, b; } L;
static ll f(L l, ll X) { return l.m * X + l.b; }
static int bad(L l1, L l2, L l3) { return (l3.b - l1.b) * (l1.m - l2.m) <= (l2.b - l1.b) * (l1.m - l3.m); }

/* dp[i] = min_j dp[j] + (x_i − x_j)² + C；直線 y = −2x_j·X + dp[j] + x_j²，斜率遞減、查詢遞增 */
static void frog(const ll *x, int n, ll C, ll *dp) {
    L dq[64];
    int head = 0, tail = 0;
    dp[0] = 0;
    dq[tail++] = (L){-2 * x[0], x[0] * x[0]};
    for (int i = 1; i < n; i++) {
        while (tail - head >= 2 && f(dq[head + 1], x[i]) <= f(dq[head], x[i])) head++;
        dp[i] = f(dq[head], x[i]) + x[i] * x[i] + C;
        L nl = {-2 * x[i], dp[i] + x[i] * x[i]};
        while (tail - head >= 2 && bad(dq[tail - 2], dq[tail - 1], nl)) tail--;
        dq[tail++] = nl;
    }
}

int main(void) {
    ll x[8] = {1, 3, 4, 7, 8, 11, 12, 15}, Cs[3] = {10, 0, 100}, dp[8], nd[8];
    for (int t = 0; t < 3; t++) {
        ll C = Cs[t];
        frog(x, 8, C, dp);
        nd[0] = 0;
        for (int i = 1; i < 8; i++) { nd[i] = -1; for (int j = 0; j < i; j++) { ll v = nd[j] + (x[i] - x[j]) * (x[i] - x[j]) + C; if (nd[i] < 0 || v < nd[i]) nd[i] = v; } }
        printf("C = %lld: dp =", C);
        for (int i = 0; i < 8; i++) printf(" %lld", dp[i]);
        printf(" | naive last = %lld\n", nd[7]);
    }
    return 0;
}
