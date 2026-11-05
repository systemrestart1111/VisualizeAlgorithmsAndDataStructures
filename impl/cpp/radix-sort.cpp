#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

void print(const char* label, int exp, const vector<int>& a) {
    cout << label;
    if (exp) cout << " " << exp << ":";
    for (int x : a) cout << " " << x;
    cout << "\n";
}

// LSD 基數排序：從個位數開始，每一位做一次穩定的計數排序
void radixSort(vector<int>& a) {
    int mx = *max_element(a.begin(), a.end());
    vector<int> out(a.size());
    for (int exp = 1; mx / exp > 0; exp *= 10) {
        int cnt[10] = {0};
        for (int x : a) cnt[x / exp % 10]++;
        for (int d = 1; d < 10; d++) cnt[d] += cnt[d - 1];
        for (int i = (int)a.size() - 1; i >= 0; i--) out[--cnt[a[i] / exp % 10]] = a[i];
        a = out;
        print("digit", exp, a);
    }
}

int main() {
    vector<int> a = {170, 45, 75, 90, 802, 24, 2, 66, 431, 318, 59, 7};
    radixSort(a);
    print("sorted:", 0, a);
}
