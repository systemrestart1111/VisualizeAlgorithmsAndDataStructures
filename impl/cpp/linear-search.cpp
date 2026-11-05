#include <iostream>
#include <vector>
using namespace std;

// 從頭到尾逐一比較，找到回傳索引，找不到回傳 -1
int linearSearch(const vector<int>& a, int t) {
    for (size_t i = 0; i < a.size(); i++)
        if (a[i] == t) return (int)i;
    return -1;
}

int main() {
    vector<int> a = {29, 4, 71, 15, 42, 8, 63, 37, 90, 22};
    cout << "search 63 -> " << linearSearch(a, 63) << "\n";
    cout << "search 100 -> " << linearSearch(a, 100) << "\n";
}
