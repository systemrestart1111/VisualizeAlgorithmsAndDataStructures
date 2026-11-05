#include <iostream>
using namespace std;

// 用擴展歐幾里得解 a·x + m·y = 1，x 就是 a 在模 m 下的反元素（需 gcd(a, m) = 1）
long long modInverse(long long a, long long m) {
    long long oldR = m, r = a, oldT = 0, t = 1;
    while (r) {
        long long q = oldR / r, tmp;
        tmp = r; r = oldR - q * r; oldR = tmp;
        tmp = t; t = oldT - q * t; oldT = tmp;
    }
    if (oldR != 1) return -1;
    return (oldT % m + m) % m;
}

long long modPow(long long a, long long n, long long m) {
    long long r = 1;
    for (a %= m; n; n >>= 1, a = a * a % m) if (n & 1) r = r * a % m;
    return r;
}

int main() {
    long long a = 17, m = 43, inv = modInverse(a, m);
    cout << a << "^-1 mod " << m << " = " << inv << "\n";
    cout << "check: " << a << " x " << inv << " mod " << m << " = " << a * inv % m << "\n";
    cout << "Fermat (m is prime): " << a << "^(" << m << "-2) mod " << m << " = " << modPow(a, m - 2, m) << "\n";
}
