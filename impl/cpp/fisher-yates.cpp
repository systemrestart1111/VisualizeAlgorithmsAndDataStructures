#include <iostream>
#include <numeric>
#include <utility>
#include <vector>
using namespace std;

long long state = 42;

// Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1
int randInt(int k) {
    state = state * 48271 % 2147483647;
    return (int)(state % k);
}

int main() {
    vector<int> a(12);
    iota(a.begin(), a.end(), 1);
    // 由後往前，每個位置 i 與 0..i 中隨機一格交換；每種排列出現的機率都是 1/n!
    for (int i = (int)a.size() - 1; i > 0; i--) swap(a[i], a[randInt(i + 1)]);
    cout << "shuffled:";
    for (int x : a) cout << " " << x;
    cout << "\n";
}
