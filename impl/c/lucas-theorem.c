#include <stdio.h>
#include <stdlib.h>

typedef long long ll;
static ll pw(ll b, ll e, ll m) { ll r = 1; b %= m; while (e) { if (e & 1) r = r * b % m; b = b * b % m; e >>= 1; } return r; }
static int is_prime(ll n) { if (n < 2) return 0; for (ll d = 2; d * d <= n; d++) if (n % d == 0) return 0; return 1; }

/* C(n, k) ≡ ∏ C(nᵢ, kᵢ) (mod p)，nᵢ、kᵢ 是 p 進位的各位數 */
static ll lucas(ll n, ll k, ll p) {
    ll *fact = malloc(sizeof(ll) * p), res = 1;
    fact[0] = 1;
    for (ll i = 1; i < p; i++) fact[i] = fact[i - 1] * i % p;
    while (n || k) {
        ll ni = n % p, ki = k % p;
        if (ki > ni) { res = 0; break; }
        res = res * (fact[ni] * pw(fact[ki], p - 2, p) % p * pw(fact[ni - ki], p - 2, p) % p) % p;
        n /= p; k /= p;
    }
    free(fact);
    return res;
}
static ll pascal(int n, int k, ll p) {
    if (k > n) return 0;
    ll row[1001] = {1};
    for (int i = 1; i <= n; i++) for (int j = i < k ? i : k; j > 0; j--) row[j] = (row[j] + row[j - 1]) % p;
    return row[k];
}

int main(void) {
    ll tests[9][3] = {{1000, 300, 13}, {5, 2, 3}, {100, 50, 7}, {10, 3, 2}, {7, 9, 5}, {999, 0, 11}, {1000000000000LL, 123456789, 99991}, {1000000000000000LL, 100000000000000LL, 7}, {6, 2, 4}};
    for (int t = 0; t < 9; t++) {
        ll n = tests[t][0], k = tests[t][1], p = tests[t][2];
        if (!is_prime(p)) printf("C(%lld,%lld) mod %lld: %lld is not prime\n", n, k, p, p);
        else if (n <= 1000) printf("C(%lld,%lld) mod %lld = %lld (pascal %lld)\n", n, k, p, lucas(n, k, p), pascal((int)n, (int)k, p));
        else printf("C(%lld,%lld) mod %lld = %lld\n", n, k, p, lucas(n, k, p));
    }
    return 0;
}
