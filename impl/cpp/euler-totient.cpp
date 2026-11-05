#include <iostream>
using namespace std;

long long gcdll(long long a, long long b) { return b ? gcdll(b, a % b) : a; }

// φ(n) = n·∏(1 − 1/p)，以 result −= result / p 實作
long long phi(long long n) {
    long long result = n;
    for (long long p = 2; p * p <= n; p++)
        if (n % p == 0) {
            while (n % p == 0) n /= p;
            result -= result / p;
        }
    if (n > 1) result -= result / n;
    return result;
}

int main() {
    for (long long n : {1LL, 2LL, 36LL, 97LL, 100LL, 360LL, 1000000LL, 999999937LL, 600851475143LL}) {
        if (n <= 1000) {
            int brute = 0;
            for (long long x = 1; x <= n; x++) if (gcdll(x, n) == 1) brute++;
            cout << "phi(" << n << ") = " << phi(n) << " (gcd count " << brute << ")\n";
        } else cout << "phi(" << n << ") = " << phi(n) << "\n";
    }
}
