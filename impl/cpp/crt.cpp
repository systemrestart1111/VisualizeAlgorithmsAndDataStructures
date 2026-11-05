#include <iostream>
#include <utility>
#include <vector>
using namespace std;

long long modInverse(long long a, long long m) {
    long long oldR = m, r = a % m, oldT = 0, t = 1;
    while (r) {
        long long q = oldR / r, tmp;
        tmp = r; r = oldR - q * r; oldR = tmp;
        tmp = t; t = oldT - q * t; oldT = tmp;
    }
    return (oldT % m + m) % m;
}

// x = Σ a_i · M_i · (M_i⁻¹ mod m_i)，其中 M_i = M / m_i；每一項只在自己的模數下不為 0
int main() {
    vector<pair<long long, long long>> eqs = {{2, 3}, {3, 5}, {2, 7}};  // x ≡ a (mod m)，模數兩兩互質
    long long M = 1, x = 0;
    for (auto& e : eqs) M *= e.second;
    for (auto& e : eqs) {
        long long a = e.first, m = e.second, Mi = M / m, inv = modInverse(Mi, m);
        cout << "a=" << a << ", m=" << m << ": M_i = " << Mi << ", M_i^-1 mod " << m << " = " << inv << ", term = " << a * Mi * inv << "\n";
        x += a * Mi * inv;
    }
    cout << "x = " << x % M << " (mod " << M << ")\n";
}
