#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

// 三次反轉：整段反轉，再分別反轉前 k 個與其餘部分
void rotateRight(vector<int>& a, int k) {
    k %= (int)a.size();
    reverse(a.begin(), a.end());
    reverse(a.begin(), a.begin() + k);
    reverse(a.begin() + k, a.end());
}

int main() {
    vector<int> a = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    rotateRight(a, 3);
    for (size_t i = 0; i < a.size(); i++) cout << a[i] << (i + 1 < a.size() ? ' ' : '\n');
}
