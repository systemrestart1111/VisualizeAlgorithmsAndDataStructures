#include <iostream>
#include <vector>
using namespace std;

// 埃拉托斯特尼篩法：從每個質數 p 的 p² 開始，把它的倍數全部劃掉
vector<int> sieve(int n) {
    vector<bool> isPrime(n + 1, true);
    isPrime[0] = isPrime[1] = false;
    for (int p = 2; p * p <= n; p++)
        if (isPrime[p])
            for (int m = p * p; m <= n; m += p) isPrime[m] = false;
    vector<int> primes;
    for (int i = 2; i <= n; i++) if (isPrime[i]) primes.push_back(i);
    return primes;
}

int main() {
    vector<int> primes = sieve(100);
    cout << "primes <= 100:";
    for (int p : primes) cout << " " << p;
    cout << "\ncount = " << primes.size() << "\n";
}
