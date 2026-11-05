#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

// 依數值範圍把元素分進 k 個桶，各桶內排序後依序串接
vector<int> bucketSort(const vector<int>& a, int k) {
    int lo = *min_element(a.begin(), a.end()), hi = *max_element(a.begin(), a.end());
    vector<vector<int>> buckets(k);
    for (int x : a) buckets[(x - lo) * k / (hi - lo + 1)].push_back(x);
    vector<int> out;
    for (int i = 0; i < k; i++) {
        sort(buckets[i].begin(), buckets[i].end());
        cout << "bucket " << i << ":";
        for (int x : buckets[i]) { cout << " " << x; out.push_back(x); }
        cout << "\n";
    }
    return out;
}

int main() {
    vector<int> a = {29, 25, 3, 49, 9, 37, 21, 43, 12, 33, 6, 41, 17, 48};
    vector<int> s = bucketSort(a, 5);
    cout << "sorted:";
    for (int x : s) cout << " " << x;
    cout << "\n";
}
