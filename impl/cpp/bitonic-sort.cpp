#include <iostream>
#include <utility>
#include <vector>
using namespace std;

// 雙調排序（n 為 2 的冪）：比較網路，每一層的比較互不相依，適合平行硬體
void bitonicSort(vector<int>& a) {
    int n = (int)a.size();
    for (int k = 2; k <= n; k *= 2)
        for (int j = k / 2; j > 0; j /= 2)
            for (int i = 0; i < n; i++) {
                int p = i ^ j;
                if (p > i) {
                    bool up = (i & k) == 0;
                    if ((a[i] > a[p]) == up) swap(a[i], a[p]);
                }
            }
}

int main() {
    vector<int> a = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47, 90, 14};
    bitonicSort(a);
    for (size_t i = 0; i < a.size(); i++) cout << a[i] << (i + 1 < a.size() ? ' ' : '\n');
}
