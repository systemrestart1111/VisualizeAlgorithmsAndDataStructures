#include <iostream>
using namespace std;

typedef unsigned long long u64;

// n < 2^32 時 a·b < 2^64，不會溢位
u64 modPow(u64 a, u64 e, u64 n) {
    u64 r = 1;
    for (a %= n; e; e >>= 1, a = a * a % n) if (e & 1) r = r * a % n;
    return r;
}

// 寫成 n-1 = d·2^s；對每個底數 a，若 a^d ≢ 1 且平方 s 次都沒出現 -1，a 就是「合數的證人」
bool isProbablePrime(u64 n, u64& witness) {
    if (n < 2) return false;
    if (n % 2 == 0) { witness = 2; return n == 2; }
    u64 d = n - 1;
    int s = 0;
    while (d % 2 == 0) { d /= 2; s++; }
    for (u64 a : {2, 3, 5, 7, 11, 13, 17}) {
        if (a % n == 0) continue;
        u64 x = modPow(a, d, n);
        if (x == 1 || x == n - 1) continue;
        bool ok = false;
        for (int r = 1; r < s && !ok; r++) {
            x = x * x % n;
            if (x == n - 1) ok = true;
        }
        if (!ok) { witness = a; return false; }
    }
    return true;
}

int main() {
    for (u64 n : {561ULL, 7919ULL, 1000003ULL, 25326001ULL, 2147483647ULL}) {
        u64 w = 0;
        if (isProbablePrime(n, w)) cout << n << ": prime\n";
        else cout << n << ": composite (witness " << w << ")\n";
    }
}
