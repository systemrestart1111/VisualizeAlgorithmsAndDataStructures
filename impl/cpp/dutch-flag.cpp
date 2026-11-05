#include <iostream>
#include <utility>
#include <vector>
using namespace std;

// 荷蘭國旗：lt 左邊 < p，gt 右邊 > p，中間 = p；一次掃描完成
pair<int, int> threeWayPartition(vector<int>& a, int p) {
    int lt = 0, i = 0, gt = (int)a.size() - 1;
    while (i <= gt) {
        if (a[i] < p) swap(a[lt++], a[i++]);
        else if (a[i] > p) swap(a[i], a[gt--]);
        else i++;
    }
    return {lt, gt};
}

int main() {
    vector<int> a = {2, 0, 1, 2, 1, 0, 0, 2, 1, 1, 0, 2, 1, 0};
    auto r = threeWayPartition(a, 1);
    for (size_t k = 0; k < a.size(); k++) cout << a[k] << (k + 1 < a.size() ? ' ' : '\n');
    cout << "< p: [0, " << r.first << "), = p: [" << r.first << ", " << r.second << "], > p: (" << r.second << ", " << a.size() << ")\n";
}
