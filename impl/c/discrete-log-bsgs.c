#include <stdio.h>
#include <stdlib.h>

typedef long long ll;
static ll pw(ll b, ll e, ll m) { ll r = 1; b %= m; while (e) { if (e & 1) r = r * b % m; b = b * b % m; e >>= 1; } return r; }
static ll gcd(ll a, ll b) { return b ? gcd(b, a % b) : a; }
/* 擴展歐幾里得求反元素 */
static ll inv(ll a, ll m) { ll g = m, x = 0, x1 = 1, a1 = a; while (a1) { ll q = g / a1, t = g - q * a1; g = a1; a1 = t; t = x - q * x1; x = x1; x1 = t; } return (x % m + m) % m; }

/* 雜湊表：開放定址 */
#define HS 131072
static ll keys[HS];
static int vals[HS], used[HS];
static void put(ll k, int v) { unsigned h = (unsigned)(k % HS); while (used[h] && keys[h] != k) h = (h + 1) % HS; if (!used[h]) { used[h] = 1; keys[h] = k; vals[h] = v; } }
static int get(ll k) { unsigned h = (unsigned)(k % HS); while (used[h]) { if (keys[h] == k) return vals[h]; h = (h + 1) % HS; } return -1; }

/* a^x ≡ b (mod M)：小步存 a^j，大步檢查 b·a^(−s·i)；需要 gcd(a, M) = 1。回傳 −1 無解、−2 不互質 */
static ll bsgs(ll a, ll b, ll M) {
    if (gcd(a % M, M) != 1) return -2;
    a %= M; b %= M;
    ll s = 1;
    while (s * s < M) s++;
    for (int i = 0; i < HS; i++) used[i] = 0;
    ll cur = 1;
    for (ll j = 0; j < s; j++) { put(cur, (int)j); cur = cur * a % M; }
    ll factor = inv(pw(a, s, M), M), gamma = b;
    for (ll i = 0; i < s; i++) {
        int j = get(gamma);
        if (j >= 0) return i * s + j;
        gamma = gamma * factor % M;
    }
    return -1;
}

int main(void) {
    ll tests[7][3] = {{3, 13, 101}, {2, 3, 7}, {5, 1, 23}, {2, 1000, 1000003}, {7, 123456, 1000000007}, {6, 4, 10}, {3, 13, 17}};
    for (int t = 0; t < 7; t++) {
        ll a = tests[t][0], b = tests[t][1], M = tests[t][2], x = bsgs(a, b, M);
        if (x == -2) printf("%lld^x = %lld mod %lld: gcd(a, M) != 1, basic BSGS not applicable\n", a, b, M);
        else if (x == -1) printf("%lld^x = %lld mod %lld: no solution\n", a, b, M);
        else printf("%lld^x = %lld mod %lld: x = %lld (check %lld)\n", a, b, M, x, pw(a, x, M));
    }
    return 0;
}
