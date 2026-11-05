#include <iostream>
#include <vector>
using namespace std;
typedef long long ll;

ll pw(ll b, ll e, ll m) { ll r = 1; b %= m; while (e) { if (e & 1) r = r * b % m; b = b * b % m; e >>= 1; } return r; }

// 位元反轉 + 蝴蝶；單位根 w = g^((p−1)/len)，逆轉換用 w⁻¹ 並乘 n⁻¹
void ntt(vector<ll> &a, bool invert, ll p, ll g) {
    int n = a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j |= bit;
        if (i < j) swap(a[i], a[j]);
    }
    for (int len = 2; len <= n; len <<= 1) {
        ll w = pw(g, (p - 1) / len, p);
        if (invert) w = pw(w, p - 2, p);
        for (int i = 0; i < n; i += len) {
            ll wj = 1;
            for (int k = 0; k < len / 2; k++) {
                ll u = a[i + k], v = a[i + k + len / 2] * wj % p;
                a[i + k] = (u + v) % p;
                a[i + k + len / 2] = (u - v + p) % p;
                wj = wj * w % p;
            }
        }
    }
    if (invert) { ll ninv = pw(n, p - 2, p); for (auto &x : a) x = x * ninv % p; }
}

void run(const vector<ll> &x, const vector<ll> &y, ll p, ll g) {
    int len = x.size() + y.size() - 1, n = 1;
    while (n < len) n <<= 1;
    if ((p - 1) % n) { cout << "mod " << p << ": length " << len << " padded size does not divide p-1, cannot transform\n"; return; }
    vector<ll> A(n, 0), B(n, 0), N(len, 0);
    for (size_t i = 0; i < x.size(); i++) A[i] = (x[i] % p + p) % p;
    for (size_t i = 0; i < y.size(); i++) B[i] = (y[i] % p + p) % p;
    ntt(A, false, p, g);
    ntt(B, false, p, g);
    vector<ll> C(n);
    for (int i = 0; i < n; i++) C[i] = A[i] * B[i] % p;
    ntt(C, true, p, g);
    for (size_t i = 0; i < x.size(); i++) for (size_t j = 0; j < y.size(); j++) N[i + j] = (N[i + j] + ((x[i] % p + p) % p) * ((y[j] % p + p) % p)) % p;
    bool same = true;
    cout << "mod " << p << ":";
    for (int i = 0; i < len; i++) { cout << " " << C[i]; if (C[i] != N[i]) same = false; }
    cout << " (naive match " << (same ? "True" : "False") << ")\n";
}

int main() {
    ll s = 2024;
    vector<ll> big1, big2;
    for (int i = 0; i < 10; i++) { s = s * 48271 % 2147483647; big1.push_back(s % 998244353); }
    for (int i = 0; i < 7; i++) { s = s * 48271 % 2147483647; big2.push_back(s % 998244353); }
    run({1, 2, 3, 4}, {5, 6, 7}, 998244353, 3);
    run({1, 2, 3, 4}, {5, 6, 7}, 17, 3);
    run({3, -1, 4}, {1, 5, 9, 2, 6}, 97, 5);
    run(big1, big2, 998244353, 3);
    run(vector<ll>(10, 1), vector<ll>(10, 1), 17, 3);
}
