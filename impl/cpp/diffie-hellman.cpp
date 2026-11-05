#include <iostream>
using namespace std;
using u64 = unsigned long long;

u64 modPow(u64 b, u64 e, u64 m) {
    u64 r = 1;
    b %= m;
    while (e) { if (e & 1) r = r * b % m; b = b * b % m; e >>= 1; }  // m < 2^32，乘積不溢位
    return r;
}

int main() {
    u64 p = 23, g = 5, a = 6, b = 15;
    u64 A = modPow(g, a, p), B = modPow(g, b, p), sa = modPow(B, a, p), sb = modPow(A, b, p);
    cout << "public: p=" << p << " g=" << g << " A=" << A << " B=" << B << "\n";
    cout << "Alice shared = " << sa << ", Bob shared = " << sb << ", equal = " << (sa == sb ? "True" : "False") << "\n";
    p = 2147483647; g = 7; a = 123456789; b = 987654321;
    A = modPow(g, a, p); B = modPow(g, b, p);
    cout << "p=" << p << ": A=" << A << " B=" << B << " shared=" << modPow(B, a, p) << " " << modPow(A, b, p) << "\n";
}
