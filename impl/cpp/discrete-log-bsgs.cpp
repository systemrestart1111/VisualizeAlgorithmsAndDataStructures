#include <iostream>
#include <unordered_map>
#include <vector>
using namespace std;
typedef long long ll;

ll pw(ll b, ll e, ll m) { ll r = 1; b %= m; while (e) { if (e & 1) r = r * b % m; b = b * b % m; e >>= 1; } return r; }
ll gcdll(ll a, ll b) { return b ? gcdll(b, a % b) : a; }
// 擴展歐幾里得求反元素
ll inv(ll a, ll m) { ll g = m, x = 0, x1 = 1, a1 = a; while (a1) { ll q = g / a1, t = g - q * a1; g = a1; a1 = t; t = x - q * x1; x = x1; x1 = t; } return (x % m + m) % m; }

// a^x ≡ b (mod M)：小步存 a^j，大步檢查 b·a^(−s·i)；需要 gcd(a, M) = 1。回傳 −1 無解、−2 不互質
ll bsgs(ll a, ll b, ll M) {
    if (gcdll(a % M, M) != 1) return -2;
    a %= M; b %= M;
    ll s = 1;
    while (s * s < M) s++;
    unordered_map<ll, ll> table;
    ll cur = 1;
    for (ll j = 0; j < s; j++) { table.emplace(cur, j); cur = cur * a % M; }
    ll factor = inv(pw(a, s, M), M), gamma = b;
    for (ll i = 0; i < s; i++) {
        auto it = table.find(gamma);
        if (it != table.end()) return i * s + it->second;
        gamma = gamma * factor % M;
    }
    return -1;
}

int main() {
    vector<vector<ll>> tests = {{3, 13, 101}, {2, 3, 7}, {5, 1, 23}, {2, 1000, 1000003}, {7, 123456, 1000000007}, {6, 4, 10}, {3, 13, 17}};
    for (auto &t : tests) {
        ll a = t[0], b = t[1], M = t[2], x = bsgs(a, b, M);
        cout << a << "^x = " << b << " mod " << M << ": ";
        if (x == -2) cout << "gcd(a, M) != 1, basic BSGS not applicable\n";
        else if (x == -1) cout << "no solution\n";
        else cout << "x = " << x << " (check " << pw(a, x, M) << ")\n";
    }
}
