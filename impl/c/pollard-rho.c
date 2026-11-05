#include <stdio.h>
#include <stdlib.h>

typedef long long ll;
/* 俄羅斯農夫乘法避免溢位：n < 2^62 時 a + b 不會溢位 */
static ll mulmod(ll a, ll b, ll m) {
    ll r = 0;
    a %= m;
    while (b) { if (b & 1) r = (r + a) % m; a = (a + a) % m; b >>= 1; }
    return r;
}
static ll gcd(ll a, ll b) { return b ? gcd(b, a % b) : a; }
static int is_prime(ll n) {
    if (n < 2) return 0;
    for (ll d = 2; d * d <= n; d++) if (n % d == 0) return 0;
    return 1;
}
/* f(x) = x² + c；龜兔賽跑找 gcd(|x − y|, n) > 1；d == n 時換 c 重試 */
static ll rho(ll n, int log) {
    for (ll c = 1;; c++) {
        ll x = 2, y = 2, d = 1;
        int steps = 0;
        while (d == 1) {
            x = (mulmod(x, x, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;
            d = gcd(llabs(x - y), n);
            steps++;
        }
        if (log) printf("%sc=%lld steps=%d d=%lld%s", c > 1 ? "; " : "", c, steps, d, d == n ? " (failed, retry)" : "");
        if (d != n) return d;
    }
}
static ll fs[64];
static int nf;
static void factor(ll n) {
    if (n == 1) return;
    if (is_prime(n)) fs[nf++] = n;
    else if (n % 2 == 0) { fs[nf++] = 2; factor(n / 2); }
    else { ll d = rho(n, 0); factor(d); factor(n / d); }
}
static int cmp(const void *a, const void *b) { ll x = *(const ll *)a, y = *(const ll *)b; return x < y ? -1 : x > y; }

int main(void) {
    ll traced[2] = {8051, 25};
    for (int t = 0; t < 2; t++) { printf("rho(%lld): ", traced[t]); rho(traced[t], 1); printf("\n"); }
    ll tests[8] = {1, 8051, 201275, 10403, 1022117, 1000003, 600851475143LL, 999985999949LL};
    for (int t = 0; t < 8; t++) {
        nf = 0;
        factor(tests[t]);
        qsort(fs, nf, sizeof(ll), cmp);
        ll prod = 1;
        printf("%lld = ", tests[t]);
        if (!nf) printf("1");
        for (int i = 0; i < nf; i++) { printf(i ? " * %lld" : "%lld", fs[i]); prod *= fs[i]; }
        printf(" (product ok %s)\n", prod == tests[t] ? "True" : "False");
    }
    return 0;
}
