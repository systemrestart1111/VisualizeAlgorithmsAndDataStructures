#include <iostream>
#include <utility>
#include <vector>
using namespace std;

// 像侏儒整理花盆：順序正確就前進，否則交換並後退一步
void gnomeSort(vector<int>& a) {
    size_t i = 0;
    while (i < a.size()) {
        if (i == 0 || a[i - 1] <= a[i]) i++;
        else {
            swap(a[i], a[i - 1]);
            i--;
        }
    }
}

int main() {
    vector<int> a = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72};
    gnomeSort(a);
    for (size_t i = 0; i < a.size(); i++) cout << a[i] << (i + 1 < a.size() ? ' ' : '\n');
}
