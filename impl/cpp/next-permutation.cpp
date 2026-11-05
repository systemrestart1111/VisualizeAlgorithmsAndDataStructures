#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

// 找轉折點 i、從右邊找比 a[i] 大的最右元素交換，再反轉尾段；已是最大排列時回到最小
void nextPerm(vector<int> &a) {
    int i = a.size() - 2;
    while (i >= 0 && a[i] >= a[i + 1]) i--;
    if (i >= 0) {
        int j = a.size() - 1;
        while (a[j] <= a[i]) j--;
        swap(a[i], a[j]);
    }
    reverse(a.begin() + i + 1, a.end());
}
void show(const char *label, const vector<int> &a) {
    cout << label;
    for (size_t i = 0; i < a.size(); i++) cout << (i ? " " : "") << a[i];
    cout << "\n";
}

int main() {
    vector<int> a = {1, 3, 5, 4, 2}, w = {3, 2, 1}, d = {1, 1, 2};
    for (int k = 0; k < 3; k++) { nextPerm(a); show("", a); }
    nextPerm(w);
    show("wrap: ", w);
    for (int k = 0; k < 3; k++) { nextPerm(d); show("dup: ", d); }
}
