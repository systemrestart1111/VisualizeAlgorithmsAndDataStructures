#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

// 統計每個值出現的次數，再用前綴和決定每個元素的最終位置（穩定）
vector<int> countingSort(const vector<int>& a) {
    int k = *max_element(a.begin(), a.end()) + 1;
    vector<int> cnt(k, 0), out(a.size());
    for (int x : a) cnt[x]++;
    for (int v = 1; v < k; v++) cnt[v] += cnt[v - 1];
    for (int i = (int)a.size() - 1; i >= 0; i--) out[--cnt[a[i]]] = a[i];
    return out;
}

int main() {
    vector<int> a = {4, 2, 7, 1, 4, 9, 3, 2, 7, 0, 5, 4, 8, 1};
    vector<int> s = countingSort(a);
    for (size_t i = 0; i < s.size(); i++) cout << s[i] << (i + 1 < s.size() ? ' ' : '\n');
}
