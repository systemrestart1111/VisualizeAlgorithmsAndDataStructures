#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

// 由下往上：MAX 層取子節點最大值、MIN 層取最小值（根為 MAX，層數交替）
int main() {
    vector<int> vals = {3, 5, 6, 9, 1, 2, 0, -1, 8, 4, 7, 2, 5, 1, 3, 6};
    int B = 2, depth = 0;
    for (size_t p = 1; p < vals.size(); p *= B) depth++;
    for (int d = depth - 1; d >= 0; d--) {
        bool isMax = d % 2 == 0;
        vector<int> next;
        for (size_t i = 0; i < vals.size(); i += B)
            next.push_back(isMax ? *max_element(vals.begin() + i, vals.begin() + i + B) : *min_element(vals.begin() + i, vals.begin() + i + B));
        vals = next;
        cout << "level " << d << " (" << (isMax ? "MAX" : "MIN") << "):";
        for (int v : vals) cout << " " << v;
        cout << "\n";
    }
    cout << "root value = " << vals[0] << "\n";
}
