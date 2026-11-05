#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {1000000, 30, -5, 30, 99999, 7, -5, 2000};
    // 把每個值換成它在「排序後去重複」陣列中的排名
    vector<int> vals = a;
    sort(vals.begin(), vals.end());
    vals.erase(unique(vals.begin(), vals.end()), vals.end());
    vector<int> ranks;
    for (int x : a) ranks.push_back(lower_bound(vals.begin(), vals.end(), x) - vals.begin());
    cout << "values:";
    for (int v : vals) cout << " " << v;
    cout << "\nranks :";
    for (int r : ranks) cout << " " << r;
    bool ok = true;
    for (size_t i = 0; i < a.size(); i++) for (size_t j = 0; j < a.size(); j++) ok &= ((a[i] < a[j]) == (ranks[i] < ranks[j])) && ((a[i] == a[j]) == (ranks[i] == ranks[j]));
    cout << "\norder preserved: " << (ok ? "True" : "False") << "\n";
}
