#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

vector<int> subsetSums(const vector<int> &xs) {
    vector<int> s = {0};
    for (int x : xs) { size_t n = s.size(); for (size_t i = 0; i < n; i++) s.push_back(s[i] + x); }
    return s;
}
// 兩半各列舉子集合和；右半排序後，對每個左半和二分搜尋 ≤ T − s 的最大值
int bestAtMost(const vector<int> &a, int T) {
    size_t h = a.size() / 2;
    vector<int> L = subsetSums(vector<int>(a.begin(), a.begin() + h)), R = subsetSums(vector<int>(a.begin() + h, a.end()));
    sort(R.begin(), R.end());
    int best = -1;
    for (int s : L) {
        if (s > T) continue;
        int x = *(upper_bound(R.begin(), R.end(), T - s) - 1);
        best = max(best, s + x);
    }
    return best;
}

int main() {
    vector<int> a = {7, 3, 12, 18, 5, 9, 14, 2};
    vector<int> all = subsetSums(a);
    for (int T : {30, 10, 1, 1000}) {
        int brute = 0;
        for (int s : all) if (s <= T) brute = max(brute, s);
        cout << "T = " << T << ": best = " << bestAtMost(a, T) << " brute = " << brute << "\n";
    }
}
