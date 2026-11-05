#include <iostream>
#include <utility>
#include <vector>
using namespace std;

// 奇偶換位排序：交替比較 (奇, 偶) 與 (偶, 奇) 相鄰對，直到沒有交換
void oddEvenSort(vector<int>& a) {
    bool done = false;
    while (!done) {
        done = true;
        for (int start = 1; start >= 0; start--)
            for (int i = start; i + 1 < (int)a.size(); i += 2)
                if (a[i] > a[i + 1]) {
                    swap(a[i], a[i + 1]);
                    done = false;
                }
    }
}

int main() {
    vector<int> a = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72};
    oddEvenSort(a);
    for (size_t i = 0; i < a.size(); i++) cout << a[i] << (i + 1 < a.size() ? ' ' : '\n');
}
