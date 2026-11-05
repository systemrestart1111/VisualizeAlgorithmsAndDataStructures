#include <iostream>
#include <utility>
#include <vector>
using namespace std;

// 雙向氣泡排序：先由左往右把最大值推到右端，再由右往左把最小值推到左端
void cocktailSort(vector<int>& a) {
    int lo = 0, hi = (int)a.size() - 1;
    bool swapped = true;
    while (swapped && lo < hi) {
        swapped = false;
        for (int i = lo; i < hi; i++)
            if (a[i] > a[i + 1]) { swap(a[i], a[i + 1]); swapped = true; }
        hi--;
        for (int i = hi; i > lo; i--)
            if (a[i - 1] > a[i]) { swap(a[i - 1], a[i]); swapped = true; }
        lo++;
    }
}

int main() {
    vector<int> a = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72};
    cocktailSort(a);
    for (size_t i = 0; i < a.size(); i++) cout << a[i] << (i + 1 < a.size() ? ' ' : '\n');
}
