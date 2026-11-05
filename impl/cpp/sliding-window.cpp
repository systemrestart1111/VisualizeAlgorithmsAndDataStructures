#include <iostream>
#include <utility>
#include <vector>
using namespace std;

// 固定長度 k：加入右邊新元素、減去左邊離開的元素；回傳 (最大和, 起點)
pair<int, int> maxWindowSum(const vector<int> &a, int k) {
    int s = 0;
    for (int i = 0; i < k; i++) s += a[i];
    int best = s, at = 0;
    for (size_t i = k; i < a.size(); i++) { s += a[i] - a[i - k]; if (s > best) { best = s; at = i - k + 1; } }
    return {best, at};
}
// 可變視窗：只適用於元素皆為正；有非正數回傳 -1，不存在回傳 0
int minLenAtLeast(const vector<int> &a, int S) {
    for (int x : a) if (x <= 0) return -1;
    int l = 0, s = 0, n = a.size(), best = n + 1;
    for (int r = 0; r < n; r++) {
        s += a[r];
        while (s >= S) { best = min(best, r - l + 1); s -= a[l++]; }
    }
    return best > n ? 0 : best;
}

int main() {
    vector<int> a = {4, 2, 12, 1, 7, 9, 3, 2, 8, 5};
    auto p = maxWindowSum(a, 3);
    cout << "max sum of length 3: " << p.first << " at " << p.second << "\n";
    cout << "shortest with sum >= 18: " << minLenAtLeast(a, 18) << "\n";
    cout << "shortest with sum >= 100: " << minLenAtLeast(a, 100) << "\n";
    int r = minLenAtLeast({3, -1, 4}, 5);
    cout << "with negatives: ";
    if (r < 0) cout << "not applicable\n"; else cout << r << "\n";
}
