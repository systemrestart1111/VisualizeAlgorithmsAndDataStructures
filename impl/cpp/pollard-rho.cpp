#include <algorithm>
#include <cstdlib>
#include <iostream>
#include <string>
#include <vector>
using namespace std;
typedef long long ll;

// 俄羅斯農夫乘法避免溢位：n < 2^62 時 a + b 不會溢位
ll mulmod(ll a, ll b, ll m) {
    ll r = 0;
    a %= m;
    while (b) { if (b & 1) r = (r + a) % m; a = (a + a) % m; b >>= 1; }
    return r;
}
ll gcdll(ll a, ll b) { return b ? gcdll(b, a % b) : a; }
bool isPrime(ll n) {
    if (n < 2) return false;
    for (ll d = 2; d * d <= n; d++) if (n % d == 0) return false;
    return true;
}
// f(x) = x² + c；龜兔賽跑找 gcd(|x − y|, n) > 1；d == n 時換 c 重試
ll rho(ll n, vector<string> *log = nullptr) {
    for (ll c = 1;; c++) {
        ll x = 2, y = 2, d = 1;
        int steps = 0;
        while (d == 1) {
            x = (mulmod(x, x, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;
            y = (mulmod(y, y, n) + c) % n;
            d = gcdll(llabs(x - y), n);
            steps++;
        }
        if (log) log->push_back("c=" + to_string(c) + " steps=" + to_string(steps) + " d=" + to_string(d) + (d == n ? " (failed, retry)" : ""));
        if (d != n) return d;
    }
}
void factor(ll n, vector<ll> &out) {
    if (n == 1) return;
    if (isPrime(n)) out.push_back(n);
    else if (n % 2 == 0) { out.push_back(2); factor(n / 2, out); }
    else { ll d = rho(n); factor(d, out); factor(n / d, out); }
}

int main() {
    for (ll n : {8051LL, 25LL}) {
        vector<string> log;
        rho(n, &log);
        cout << "rho(" << n << "): ";
        for (size_t i = 0; i < log.size(); i++) cout << (i ? "; " : "") << log[i];
        cout << "\n";
    }
    for (ll n : {1LL, 8051LL, 201275LL, 10403LL, 1022117LL, 1000003LL, 600851475143LL, 999985999949LL}) {
        vector<ll> fs;
        factor(n, fs);
        sort(fs.begin(), fs.end());
        ll prod = 1;
        cout << n << " = ";
        if (fs.empty()) cout << "1";
        for (size_t i = 0; i < fs.size(); i++) { cout << (i ? " * " : "") << fs[i]; prod *= fs[i]; }
        cout << " (product ok " << (prod == n ? "True" : "False") << ")\n";
    }
}
