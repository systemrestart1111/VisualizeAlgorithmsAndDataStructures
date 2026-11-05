#include <iostream>
#include <vector>
using namespace std;

// 線性篩：每個合數只被它的「最小質因數」劃掉一次，因此總共 O(n)
int main() {
    int n = 60;
    vector<int> spf(n + 1, 0), primes;  // spf[i] = i 的最小質因數
    for (int i = 2; i <= n; i++) {
        if (spf[i] == 0) { spf[i] = i; primes.push_back(i); }
        for (int p : primes) {
            if (p > spf[i] || i * p > n) break;
            spf[i * p] = p;
        }
    }
    cout << "primes:";
    for (int p : primes) cout << " " << p;
    cout << "\nsmallest prime factor of 2..20:";
    for (int i = 2; i <= 20; i++) cout << " " << spf[i];
    cout << "\n";
}
