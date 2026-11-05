#include <iostream>
#include <vector>
using namespace std;
using ll = long long;

// 擴展歐幾里得求 e 在 mod φ 的反元素
ll inverse(ll e, ll phi) {
    ll r0 = e, r1 = phi, s0 = 1, s1 = 0;
    while (r1) {
        ll q = r0 / r1, t;
        t = r0 - q * r1; r0 = r1; r1 = t;
        t = s0 - q * s1; s0 = s1; s1 = t;
    }
    return ((s0 % phi) + phi) % phi;
}
// 平方乘法：由高位到低位
ll modPow(ll b, ll e, ll m) {
    ll r = 1;
    for (int i = 62; i >= 0; i--) {
        r = r * r % m;
        if ((e >> i) & 1) r = r * b % m;
    }
    return r;
}
void show(const char *label, const vector<ll> &v) {
    cout << label << "[";
    for (size_t i = 0; i < v.size(); i++) cout << (i ? ", " : "") << v[i];
    cout << "]\n";
}

int main() {
    ll p = 61, q = 53, e = 17, n = p * q, phi = (p - 1) * (q - 1), d = inverse(e, phi);
    cout << "n = " << n << ", phi = " << phi << ", e = " << e << ", d = " << d << "\n";
    vector<ll> msgs = {65, 66, 67}, cs, back;
    for (ll m : msgs) cs.push_back(modPow(m, e, n));
    for (ll c : cs) back.push_back(modPow(c, d, n));
    show("cipher: ", cs);
    show("plain : ", back);
}
