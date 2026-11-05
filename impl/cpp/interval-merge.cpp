#include <algorithm>
#include <iostream>
#include <utility>
#include <vector>
using namespace std;
using Iv = pair<int, int>;

// 依左端點排序；touch=true 時相接的閉區間（如 [1,3] 與 [3,5]）也合併
vector<Iv> mergeIv(vector<Iv> iv, bool touch = true) {
    sort(iv.begin(), iv.end());
    vector<Iv> out;
    for (auto &p : iv) {
        if (!out.empty() && (touch ? p.first <= out.back().second : p.first < out.back().second)) out.back().second = max(out.back().second, p.second);
        else out.push_back(p);
    }
    return out;
}
void show(const char *label, const vector<Iv> &v) {
    cout << label;
    for (size_t i = 0; i < v.size(); i++) cout << (i ? " " : "") << "[" << v[i].first << "," << v[i].second << "]";
    cout << "\n";
}

int main() {
    vector<Iv> iv = {{1, 3}, {8, 10}, {2, 6}, {10, 12}, {15, 18}, {17, 20}};
    show("merge touching: ", mergeIv(iv));
    show("keep touching : ", mergeIv(iv, false));
    show("single        : ", mergeIv({{5, 5}}));
}
