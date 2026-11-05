#include <array>
#include <cstdio>
#include <vector>
using namespace std;

const int W = 5;
// 固定 W 位元，由高位到低位；每個節點記錄經過的數字個數，支援重複與刪除
struct BinaryTrie {
    vector<array<int, 2>> ch{{{-1, -1}}};
    vector<int> cnt{0};
    void add(int x, int d) {
        int u = 0;
        cnt[0] += d;
        for (int i = W - 1; i >= 0; i--) {
            int b = (x >> i) & 1;
            if (ch[u][b] < 0) { ch[u][b] = cnt.size(); ch.push_back({{-1, -1}}); cnt.push_back(0); }
            u = ch[u][b];
            cnt[u] += d;
        }
    }
    // 每一位盡量走與 x 相反的分支
    int maxXor(int x) const {
        int u = 0, y = 0;
        for (int i = W - 1; i >= 0; i--) {
            int b = (x >> i) & 1, v = ch[u][1 - b];
            if (v >= 0 && cnt[v] > 0) { u = v; y |= (1 - b) << i; }
            else { u = ch[u][b]; y |= b << i; }
        }
        return y;
    }
};

int main() {
    BinaryTrie t;
    for (int x : {3, 10, 5, 25, 2, 8}) t.add(x, 1);
    for (int x : {5, 25, 7, 31, 0}) { int y = t.maxXor(x); printf("max xor with %2d: %2d -> %d\n", x, y, x ^ y); }
    t.add(25, -1);
    int y = t.maxXor(5);
    printf("after delete 25, max xor with 5: %d -> %d\n", y, 5 ^ y);
}
