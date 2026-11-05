#include <iostream>
#include <vector>
using namespace std;
typedef long long ll;

ll pw(ll b, ll e, ll m) { ll r = 1; b %= m; while (e) { if (e & 1) r = r * b % m; b = b * b % m; e >>= 1; } return r; }
bool isPrime(ll n) { if (n < 2) return false; for (ll d = 2; d * d <= n; d++) if (n % d == 0) return false; return true; }

// C(n, k) ≡ ∏ C(nᵢ, kᵢ) (mod p)，nᵢ、kᵢ 是 p 進位的各位數
ll lucas(ll n, ll k, ll p) {
    vector<ll> fact(p, 1);
    for (ll i = 1; i < p; i++) fact[i] = fact[i - 1] * i % p;
    ll res = 1;
    while (n || k) {
        ll ni = n % p, ki = k % p;
        if (ki > ni) return 0;
        res = res * (fact[ni] * pw(fact[ki], p - 2, p) % p * pw(fact[ni - ki], p - 2, p) % p) % p;
        n /= p; k /= p;
    }
    return res;
}
ll pascal(int n, int k, ll p) {
    if (k > n) return 0;
    vector<ll> row(k + 1, 0);
    row[0] = 1;
    for (int i = 1; i <= n; i++) for (int j = min(i, k); j > 0; j--) row[j] = (row[j] + row[j - 1]) % p;
    return row[k];
}

int main() {
    vector<vector<ll>> tests = {{1000, 300, 13}, {5, 2, 3}, {100, 50, 7}, {10, 3, 2}, {7, 9, 5}, {999, 0, 11}, {1000000000000LL, 123456789, 99991}, {1000000000000000LL, 100000000000000LL, 7}, {6, 2, 4}};
    for (auto &t : tests) {
        ll n = t[0], k = t[1], p = t[2];
        cout << "C(" << n << "," << k << ") mod " << p;
        if (!isPrime(p)) cout << ": " << p << " is not prime\n";
        else if (n <= 1000) cout << " = " << lucas(n, k, p) << " (pascal " << pascal(n, k, p) << ")\n";
        else cout << " = " << lucas(n, k, p) << "\n";
    }
}
