#include <iostream>
#include <vector>
using namespace std;

// 間隔 gap 從 n/2 逐次減半，對每個間隔做插入排序；最後 gap = 1 時就是一般的插入排序
void shellSort(vector<int>& a) {
    int n = (int)a.size();
    for (int gap = n / 2; gap > 0; gap /= 2)
        for (int i = gap; i < n; i++) {
            int key = a[i], j = i;
            while (j >= gap && a[j - gap] > key) {
                a[j] = a[j - gap];
                j -= gap;
            }
            a[j] = key;
        }
}

int main() {
    vector<int> a = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72};
    shellSort(a);
    for (size_t i = 0; i < a.size(); i++) cout << a[i] << (i + 1 < a.size() ? ' ' : '\n');
}
