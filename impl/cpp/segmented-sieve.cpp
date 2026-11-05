#include <cmath>
#include <iostream>
#include <vector>
using namespace std;

// 先用普通篩法求出 √hi 以內的質數，再只在 [lo, hi] 這一段裡劃掉它們的倍數（記憶體只需區間長度）
int main() {
    long long lo = 1000, hi = 1060;
    int lim = (int)sqrt((double)hi);
    vector<bool> comp(lim + 1, false), mark(hi - lo + 1, true);
    vector<int> small;
    for (int p = 2; p <= lim; p++) {
        if (comp[p]) continue;
        small.push_back(p);
        for (int m = p * p; m <= lim; m += p) comp[m] = true;
    }
    for (long long p : small) {
        long long start = max(p * p, (lo + p - 1) / p * p);  // 區間內第一個 p 的倍數
        for (long long m = start; m <= hi; m += p) mark[m - lo] = false;
    }
    cout << "base primes <= sqrt(" << hi << "):";
    for (int p : small) cout << " " << p;
    cout << "\nprimes in [" << lo << ", " << hi << "]:";
    for (long long i = 0; i <= hi - lo; i++) if (mark[i] && lo + i >= 2) cout << " " << lo + i;
    cout << "\n";
}
