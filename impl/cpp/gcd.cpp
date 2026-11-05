#include <iostream>
using namespace std;

// 輾轉相除：gcd(a, b) = gcd(b, a mod b)，直到餘數為 0
long long gcd(long long a, long long b) {
    while (b) {
        cout << a << " = " << a / b << " x " << b << " + " << a % b << "\n";
        long long r = a % b;
        a = b;
        b = r;
    }
    return a;
}

int main() { cout << "gcd = " << gcd(252, 105) << "\n"; }
