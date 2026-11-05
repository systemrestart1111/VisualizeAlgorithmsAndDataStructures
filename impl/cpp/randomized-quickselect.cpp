#include <iostream>
#include <numeric>
#include <utility>
#include <vector>
using namespace std;

long long state = 42;

// Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1
int randInt(int k) {
    state = state * 48271 % 2147483647;
    return (int)(state % k);
}

// 隨機選 pivot，讓已排序等「最壞輸入」也只有極低機率退化成 O(n²)；期望時間 O(n)
int quickselect(vector<int>& a, int k) {
    int lo = 0, hi = (int)a.size() - 1;
    for (;;) {
        swap(a[lo + randInt(hi - lo + 1)], a[hi]);
        int pivot = a[hi], i = lo;
        for (int j = lo; j < hi; j++)
            if (a[j] < pivot) swap(a[i++], a[j]);
        swap(a[i], a[hi]);
        cout << "range [" << lo << ", " << hi << "] pivot " << pivot << " -> position " << i << "\n";
        if (i == k) return a[i];
        if (k < i) hi = i - 1;
        else lo = i + 1;
    }
}

int main() {
    vector<int> a(14);
    iota(a.begin(), a.end(), 1);
    int r = quickselect(a, 3);
    cout << "k = 3 -> " << r << "\n";
}
