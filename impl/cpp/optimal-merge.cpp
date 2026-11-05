#include <functional>
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

// 每次合併最短的兩個檔案（與霍夫曼編碼同樣的貪婪策略），總搬移成本最小
int main() {
    priority_queue<int, vector<int>, greater<int>> pq;
    for (int x : {20, 30, 10, 5, 30, 15}) pq.push(x);
    int total = 0;
    while (pq.size() > 1) {
        int a = pq.top(); pq.pop();
        int b = pq.top(); pq.pop();
        total += a + b;
        pq.push(a + b);
        cout << "merge " << a << " + " << b << " = " << a + b << "\n";
    }
    cout << "total cost = " << total << "\n";
}
