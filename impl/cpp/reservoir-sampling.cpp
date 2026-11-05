#include <iostream>
#include <vector>
using namespace std;

long long state = 42;

// Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1
int randInt(int k) {
    state = state * 48271 % 2147483647;
    return (int)(state % k);
}

// 演算法 R：先放前 k 個；第 i 個（0 起算）元素以 k/(i+1) 的機率取代蓄水池中隨機一格
// 不需事先知道串流長度，最後每個元素被選中的機率都是 k/n
int main() {
    vector<int> stream = {12, 45, 7, 33, 89, 21, 64, 3, 58, 90, 17, 76, 40, 5, 61};
    int K = 4;
    vector<int> res(stream.begin(), stream.begin() + K);
    for (int i = K; i < (int)stream.size(); i++) {
        int j = randInt(i + 1);
        if (j < K) {
            cout << "item " << stream[i] << " replaces slot " << j << " (" << res[j] << ")\n";
            res[j] = stream[i];
        }
    }
    cout << "sample:";
    for (int x : res) cout << " " << x;
    cout << "\n";
}
