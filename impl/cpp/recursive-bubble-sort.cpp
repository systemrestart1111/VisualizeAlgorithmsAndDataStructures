#include <iostream>
#include <vector>
using namespace std;

// 一輪把最大值推到 n-1，再遞迴處理前 n-1 個；沒有交換就提早結束。回傳呼叫次數
int bubble(vector<int> &a, int n) {
    if (n <= 1) return 1;
    bool swapped = false;
    for (int j = 0; j < n - 1; j++)
        if (a[j] > a[j + 1]) { swap(a[j], a[j + 1]); swapped = true; }
    if (!swapped) return 1;
    return 1 + bubble(a, n - 1);
}

int main() {
    vector<vector<int>> tests = {{38, 27, 43, 3, 9, 82, 10, 55}, {}, {7}, {1, 2, 3, 4}};
    for (auto &a : tests) {
        int calls = bubble(a, a.size());
        cout << "sorted: [";
        for (size_t i = 0; i < a.size(); i++) cout << (i ? ", " : "") << a[i];
        cout << "] calls: " << calls << "\n";
    }
}
